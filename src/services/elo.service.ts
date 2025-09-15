import {
  getGameElos,
  getGameElosByTeam,
  getLatestEloData,
  LatestELO,
} from '@/data/gameElo'
import { createApiError } from '../types/errors'
import { GameELO, toGameELO } from '@/models/gameElo'

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
}

// Export singleton instance
export const eloService = EloService.getInstance()
