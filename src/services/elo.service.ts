import {
  getGameElos,
  getGameElosByTeam,
  getLatestEloData,
  LatestELO,
} from '@/data/gameElo'
import { createApiError } from '../types/errors'
import { GameELO, GameELOModel, toGameELO } from '@/models/gameElo'
import { getScheduleByDate } from '@/data/schedule'

export class EloService {
  private static instance: EloService

  private constructor() {}

  public static getInstance(): EloService {
    if (!EloService.instance) {
      EloService.instance = new EloService()
    }
    return EloService.instance
  }

  async getLatestElos(): Promise<LatestELO[]> {
    try {
      return await getLatestEloData()
    } catch (error) {
      throw createApiError(
        'getLatestElos',
        `Failed to fetch latest ELO data: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getLastEloGames(abbrev: string, limit: number): Promise<GameELO[]> {
    try {
      const last10 = await getGameElos(abbrev, limit)
      return last10.map(toGameELO)
    } catch (error) {
      throw createApiError(
        'getLast10EloGames',
        `Failed to fetch last 10 ELO games: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getLeagueGameEloHistoryByTeam(): Promise<{
    [abbrev: string]: GameELO[]
  }> {
    try {
      return await getGameElosByTeam(82)
    } catch (error) {
      throw createApiError(
        'getLeagueGameEloHistoryByTeam',
        `Failed to fetch league game ELO history by team: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async createNextDayGameElosWithPredictions() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const dateStr = tomorrow.toISOString().slice(0, 10)

    // 1. Get tomorrow's games
    const gameWeek = await getScheduleByDate(dateStr)
    const games = gameWeek.gameWeek[0]?.games || []

    if (games.length === 0) {
      console.log('No games scheduled for tomorrow.')
      return
    }

    console.log(games)

    // 2. Get latest ELOs for all teams
    const latestElos = await this.getLatestElos()
    const eloMap = Object.fromEntries(latestElos.map((e) => [e.abbrev, e.elo]))

    for (const game of games) {
      const homeElo = eloMap[game.homeTeam.abbrev]
      const awayElo = eloMap[game.awayTeam.abbrev]

      // 3. Calculate expected result and prediction
      // Example ELO prediction logic (replace with your actual logic)
      const kFactor = 20
      const homeAdvantage = 35
      const expectedHome =
        1 / (1 + Math.pow(10, (awayElo - homeElo - homeAdvantage) / 400))
      const expectedAway = 1 - expectedHome

      // 4. Create GameELO document
      const gameEloDoc = new GameELOModel({
        gameId: game.id,
        season: game.season,
        gameDate: new Date(game.startTimeUTC),
        homeTeam: {
          abbrev: game.homeTeam.abbrev,
          eloBefore: homeElo,
          eloAfter: homeElo, // will update after game
          score: 0, // will update after game
        },
        awayTeam: {
          abbrev: game.awayTeam.abbrev,
          eloBefore: awayElo,
          eloAfter: awayElo,
          score: 0,
        },
        eloChange: {
          homeTeam: 0,
          awayTeam: 0,
        },
        kFactor,
        homeAdvantage,
        expectedResult: {
          homeTeam: expectedHome,
          awayTeam: expectedAway,
        },
        actualResult: {
          homeTeam: 0,
          awayTeam: 0,
        },
        modelVersion: 'v1',
      })

      await gameEloDoc.save()
    }
  }
}

// Export singleton instance
export const eloService = EloService.getInstance()
