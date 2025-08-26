import { GameELODocument, GameELOModel } from '@/models/gameElo'

export interface LatestELO {
  abbrev: string
  elo: number
  season: number
}

export async function getLatestEloData(): Promise<LatestELO[]> {
  try {
    // Get last season string, e.g. '20242025'
    const currentYear = new Date().getFullYear()
    const lastSeason = Number(`${currentYear - 1}${currentYear}`)

    // Find all teams that played last season
    const teams = await GameELOModel.distinct('homeTeam.abbrev', {
      season: lastSeason,
    })

    // For each team, get their most recent gameELO entry for last season
    const latestElos = await Promise.all(
      teams.map(async (abbrev: string) => {
        const latestGame = await GameELOModel.findOne({
          $or: [{ 'homeTeam.abbrev': abbrev }, { 'awayTeam.abbrev': abbrev }],
          season: lastSeason,
        })
          .sort({ gameDate: -1 })
          .exec()
        if (!latestGame) {
          return null
        }
        if (latestGame.homeTeam.abbrev === abbrev) {
          return {
            abbrev,
            elo: latestGame.homeTeam.eloAfter,
            season: lastSeason,
          }
        }
        if (latestGame.awayTeam.abbrev === abbrev) {
          return {
            abbrev,
            elo: latestGame.awayTeam.eloAfter,
            season: lastSeason,
          }
        }
        throw new Error('Team abbrev not found in latest game')
      })
    )

    return latestElos.filter((elo) => elo != null)
  } catch (error) {
    console.error('Error fetching latest ELO data:', error)
    throw error
  }
}

export async function getGameElosLast10(
  abbrev: string
): Promise<GameELODocument[]> {
  try {
    const games = await GameELOModel.find({
      $or: [{ 'homeTeam.abbrev': abbrev }, { 'awayTeam.abbrev': abbrev }],
    })
      .sort({ gameDate: -1 })
      .limit(10)
      .exec()
    return games
  } catch (error) {
    console.error(`Error fetching last 10 ELO games for ${abbrev}:`, error)
    throw error
  }
}
