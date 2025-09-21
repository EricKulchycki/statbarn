import {
  GameELO,
  GameELODocument,
  GameELOModel,
  toGameELO,
} from '@/models/gameElo'

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

export async function getGameElos(
  abbrev: string,
  limit: number
): Promise<GameELODocument[]> {
  try {
    const games = await GameELOModel.find({
      $or: [{ 'homeTeam.abbrev': abbrev }, { 'awayTeam.abbrev': abbrev }],
    })
      .sort({ gameDate: -1 })
      .limit(limit)
      .exec()
    return games
  } catch (error) {
    console.error(
      `Error fetching last ${limit} ELO games for ${abbrev}:`,
      error
    )
    throw error
  }
}

export async function getGameElosByTeam(limit: number): Promise<{
  [abbrev: string]: GameELO[]
}> {
  // Get all unique team abbreviations from home and away teams
  const homeTeams = await GameELOModel.distinct('homeTeam.abbrev')
  const awayTeams = await GameELOModel.distinct('awayTeam.abbrev')
  const allTeams = Array.from(new Set([...homeTeams, ...awayTeams]))

  const result: { [abbrev: string]: GameELO[] } = {}

  // For each team, get their last 82 games (as home or away)
  await Promise.all(
    allTeams.map(async (abbrev) => {
      const games = await GameELOModel.find({
        $or: [{ 'homeTeam.abbrev': abbrev }, { 'awayTeam.abbrev': abbrev }],
      })
        .sort({ gameDate: -1 })
        .limit(limit)
        .lean()
        .exec()

      const gamesMapped = games.map(toGameELO)

      result[abbrev] = gamesMapped.sort(
        (a, b) =>
          new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime()
      )
    })
  )

  return result
}

export async function getGameElosForDate(date: Date): Promise<GameELO[]> {
  try {
    const dateStr = date.toISOString().split('T')[0]

    const allGames = await GameELOModel.find()
      .sort({ gameDate: -1 })
      .limit(100) // Fetch a large number to ensure we get all games
      .exec()
    const gamesOnDate = allGames.filter((game) => {
      const gameDateStr = new Date(game.gameDate).toISOString().split('T')[0]
      return gameDateStr === dateStr
    })

    return gamesOnDate.map(toGameELO)
  } catch (error) {
    console.error(`Error fetching ELO games for date ${date}:`, error)
    throw error
  }
}
