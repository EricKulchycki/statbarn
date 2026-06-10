import { getDailyScoresByDate, getThisWeeksGames } from '@/data/games'
import { createApiError, createNotFoundError } from '@/types/errors'
import { NHLGame, NHLGameDay } from '@/types/game'
import { DateTime } from 'luxon'

export class GameService {
  private static instance: GameService

  private constructor() {}

  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService()
    }
    return GameService.instance
  }

  async getThisWeeksGames(date?: DateTime): Promise<NHLGameDay[]> {
    /*
      Fetch the NHL schedule for the next 7 days, starting from today
    */
    try {
      const games = await getThisWeeksGames(date)
      if (!games) {
        throw createNotFoundError('Games', 'this week')
      }
      return games.gameWeek
    } catch (error) {
      if ((error as unknown as { code: string }).code === 'NOT_FOUND') {
        throw error
      }
      throw createApiError(
        'getTodaysGames',
        `Failed to fetch today's games: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getGamesByDate(date: string): Promise<NHLGame[]> {
    try {
      const games = await getDailyScoresByDate(date)
      if (!games || games.games.length === 0) {
        throw createNotFoundError('Games', date)
      }
      return games.games
    } catch (error) {
      if ((error as unknown as { code: string }).code === 'NOT_FOUND') {
        throw error
      }
      throw createApiError(
        'getGamesByDate',
        `Failed to fetch games for date ${date}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

// Export singleton instance
export const gameService = GameService.getInstance()
