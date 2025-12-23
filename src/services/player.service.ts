import {
  getTopScorers,
  getTopGoalies,
  getEnhancedTopScorers,
  getEnhancedTopGoalies,
} from '@/data/player'
import {
  NHLSkaterLeader,
  NHLGoalieLeader,
  EnhancedSkaterStats,
  EnhancedGoalieStats,
} from '@/types/player'
import { createApiError } from '@/types/errors'

export class PlayerService {
  private static instance: PlayerService

  private constructor() {}

  public static getInstance(): PlayerService {
    if (!PlayerService.instance) {
      PlayerService.instance = new PlayerService()
    }
    return PlayerService.instance
  }

  async getTopScorers(limit: number = 10): Promise<NHLSkaterLeader[]> {
    try {
      return await getTopScorers(limit)
    } catch (error) {
      throw createApiError(
        'getTopScorers',
        `Failed to fetch top scorers: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getTopGoalies(limit: number = 5): Promise<NHLGoalieLeader[]> {
    try {
      return await getTopGoalies(limit)
    } catch (error) {
      throw createApiError(
        'getTopGoalies',
        `Failed to fetch top goalies: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getEnhancedTopScorers(
    limit: number = 10
  ): Promise<EnhancedSkaterStats[]> {
    try {
      return await getEnhancedTopScorers(limit)
    } catch (error) {
      throw createApiError(
        'getEnhancedTopScorers',
        `Failed to fetch enhanced top scorers: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getEnhancedTopGoalies(
    limit: number = 10
  ): Promise<EnhancedGoalieStats[]> {
    try {
      return await getEnhancedTopGoalies(limit, 10)
    } catch (error) {
      throw createApiError(
        'getEnhancedTopGoalies',
        `Failed to fetch enhanced top goalies: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

export const playerService = PlayerService.getInstance()
