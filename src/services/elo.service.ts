import {
  countSeasonsGames,
  createGameElo,
  getAllGamesForSeason,
  getGameElos,
  getGameElosByTeam,
  getGameElosForDate,
  getLatestEloData,
  LatestELO,
} from '@/data/gameElo'
import { createApiError } from '../types/errors'
import { GameELO, toGameELO } from '@/models/gameElo'
import {
  getActualWinnerFromGameELO,
  getPredictedWinnerFromGameELO,
} from '@/utils/gameElo'

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

  async getLastEloGamesForDate(date: Date): Promise<GameELO[]> {
    try {
      return await getGameElosForDate(date)
    } catch (error) {
      throw createApiError(
        'getLastEloGamesForDate',
        `Failed to fetch last ELO games for date: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async createGameElo(gameElo: GameELO): Promise<GameELO> {
    try {
      return await createGameElo(gameElo)
    } catch (error) {
      throw createApiError(
        'createGameElo',
        `Failed to create GameELO: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async countSeasonsCorrectPredictions(season: number): Promise<number> {
    try {
      const games = await getAllGamesForSeason(season)
      const correctPredictions = games.filter((game) => {
        const predictedWinner = getPredictedWinnerFromGameELO(game)
        const actualWinner = getActualWinnerFromGameELO(game)
        return predictedWinner === actualWinner
      })
      return correctPredictions.length
    } catch (error) {
      throw createApiError(
        'countSeasonsCorrectPredictions',
        `Failed to count season's correct predictions: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getAllGameElosForSeason(season: number): Promise<GameELO[]> {
    try {
      const games = await getAllGamesForSeason(season)
      return games
    } catch (error) {
      throw createApiError(
        'getSeasonsGameElos',
        `Failed to fetch season's game ELOs: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async countSeasonsGames(season: number): Promise<number> {
    try {
      return await countSeasonsGames(season)
    } catch (error) {
      throw createApiError(
        'getCompletedGamesForSeason',
        `Failed to fetch completed games for season: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

// Export singleton instance
export const eloService = EloService.getInstance()
