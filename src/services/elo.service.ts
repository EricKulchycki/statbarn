import { calculateSeasonELO } from '@/lib/elo'
import { getGameElosLast10, getLatestEloData, LatestELO } from '@/data/gameElo'
import { getTeams } from '@/data/teams'
import { getCurrentNHLSeason } from '@/utils/currentSeason'
import { ELO_CONFIG } from '../constants'
import { createApiError } from '../types/errors'
import { SeasonELO } from '@/types/elo'
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

  async getLast10EloGames(abbrev: string): Promise<GameELO[]> {
    try {
      const last10 = await getGameElosLast10(abbrev)
      return last10.map(toGameELO)
    } catch (error) {
      throw createApiError(
        'getLast10EloGames',
        `Failed to fetch last 10 ELO games: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async calculateCurrentSeasonElos(): Promise<SeasonELO[]> {
    try {
      const teams = await getTeams()
      const lastSeasonElos = await getLatestEloData()
      const currentSeason = getCurrentNHLSeason()

      return await calculateSeasonELO(currentSeason, teams, lastSeasonElos)
    } catch (error) {
      throw createApiError(
        'calculateCurrentSeasonElos',
        `Failed to calculate current season ELOs: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async calculateElosForDate(date: Date): Promise<SeasonELO[]> {
    try {
      const teams = await getTeams()
      const lastSeasonElos = await getLatestEloData()
      const currentSeason = getCurrentNHLSeason()

      return await calculateSeasonELO(
        currentSeason,
        teams,
        lastSeasonElos,
        date
      )
    } catch (error) {
      throw createApiError(
        'calculateElosForDate',
        `Failed to calculate ELOs for date ${date.toISOString()}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  calculateEloChange(
    currentRating: number,
    expectedScore: number,
    actualScore: number
  ): number {
    const kFactor = ELO_CONFIG.kFactor
    return Math.round(kFactor * (actualScore - expectedScore))
  }

  calculateExpectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
  }

  applyHomeAdvantage(rating: number): number {
    return rating + ELO_CONFIG.homeAdvantage
  }
}

// Export singleton instance
export const eloService = EloService.getInstance()
