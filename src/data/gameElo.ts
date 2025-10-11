import { GameType } from '@/constants'
import {
  GameELO,
  GameELODocument,
  GameELOModel,
  toGameELO,
} from '@/models/gameElo'
import { getCurrentNHLSeason } from '@/utils/currentSeason'
import { DateTime } from 'luxon'

export interface LatestELO {
  abbrev: string
  elo: number
  season: number
}

export async function getLatestEloData(): Promise<LatestELO[]> {
  try {
    // Get last season string, e.g. '20242025'
    const currentSeason = Number(getCurrentNHLSeason())

    // Find all teams that played last season
    const teams = await GameELOModel.distinct('homeTeam.abbrev', {
      season: currentSeason,
    })

    // For each team, get their most recent gameELO entry for last season
    const latestElos = await Promise.all(
      teams.map(async (abbrev: string) => {
        const latestGame = await GameELOModel.findOne({
          $or: [{ 'homeTeam.abbrev': abbrev }, { 'awayTeam.abbrev': abbrev }],
          season: currentSeason,
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
            season: currentSeason,
          }
        }
        if (latestGame.awayTeam.abbrev === abbrev) {
          return {
            abbrev,
            elo: latestGame.awayTeam.eloAfter,
            season: currentSeason,
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
  limit: number,
  gameType: GameType = GameType.REGULAR
): Promise<GameELODocument[]> {
  try {
    const games = await GameELOModel.find({
      gameType: gameType.valueOf(),
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

/* date will always be localized, need to filter out games that happened technically
 the day before due to their timezone
*/
export async function getGameElosForDate(date: Date): Promise<GameELO[]> {
  const dateStr = DateTime.fromJSDate(date).toISODate()
  console.log('Filtering ELO games for date:', dateStr)
  try {
    const gamesOnDate = await GameELOModel.find({
      gameDate: { $gt: dateStr },
    }).exec()

    const filteredGames = gamesOnDate.filter((game) => {
      const gameDate = DateTime.fromJSDate(game.gameDate)
        .setZone(game.gameTimezone)
        .toISODate()
      return gameDate === dateStr
    })

    return filteredGames.map(toGameELO)
  } catch (error) {
    console.error(`Error fetching ELO games for date ${date}:`, error)
    throw error
  }
}

export async function createGameElo(gameElo: GameELO): Promise<GameELO> {
  try {
    const gameEloDocument = await GameELOModel.create(gameElo)
    return toGameELO(gameEloDocument)
  } catch (error) {
    console.error('Error creating GameELO:', error)
    throw error
  }
}

export async function getAllGamesForSeason(
  season: number,
  gameType: GameType = GameType.REGULAR
): Promise<GameELO[]> {
  try {
    const games = await GameELOModel.find({
      season,
      gameType,
    }).exec()
    return games.map(toGameELO)
  } catch (error) {
    console.error(`Error fetching all GameELOs for season ${season}:`, error)
    throw error
  }
}

export async function countSeasonsGames(season: number): Promise<number> {
  try {
    const games = await GameELOModel.find({
      season,
      gameType: GameType.REGULAR,
    }).exec()
    return games.length
  } catch (error) {
    console.error(`Error fetching all GameELOs for season ${season}:`, error)
    throw error
  }
}

export async function getMatchupHistory(
  teamA: string,
  teamB: string,
  limit: number = 10
): Promise<GameELO[]> {
  try {
    const matchupGames = await GameELOModel.find({
      $or: [
        { 'homeTeam.abbrev': teamA, 'awayTeam.abbrev': teamB },
        { 'homeTeam.abbrev': teamB, 'awayTeam.abbrev': teamA },
      ],
    })
      .limit(limit)
      .sort({ gameDate: -1 })
      .exec()
    return matchupGames.map(toGameELO)
  } catch (error) {
    console.error(
      `Error fetching matchup history between ${teamA} and ${teamB}:`,
      error
    )
    throw error
  }
}
