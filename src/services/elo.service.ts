import {
  countSeasonCorrectPredictions,
  countSeasonGames,
  getAllGamePredictionsForSeason,
  getCompletedGamesForDate,
  getLatestEloData,
  getLeagueGameHistoryByTeam,
  getMatchupHistoryForTeam,
  getTeamSeasonGames,
  LatestELO,
} from '@/data/teams'
import { GamePrediction } from '@/types/gamePrediction'
import { TeamSeasonGame } from '@/types/team'
import { getCurrentNHLSeason } from '@/utils/currentSeason'
import { createApiError } from '../types/errors'

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

  async getLastEloGames(
    abbrev: string,
    limit: number
  ): Promise<TeamSeasonGame[]> {
    try {
      const season = Number(getCurrentNHLSeason())
      return await getTeamSeasonGames(abbrev, season, limit)
    } catch (error) {
      throw createApiError(
        'getLastEloGames',
        `Failed to fetch last ELO games: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getLeagueGameHistoryByTeam(): Promise<{
    [abbrev: string]: TeamSeasonGame[]
  }> {
    try {
      const season = Number(getCurrentNHLSeason())
      return await getLeagueGameHistoryByTeam(season, 82)
    } catch (error) {
      throw createApiError(
        'getLeagueGameHistoryByTeam',
        `Failed to fetch league game history by team: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getLastEloGamesForDate(date: Date): Promise<GamePrediction[]> {
    try {
      return await getCompletedGamesForDate(date)
    } catch (error) {
      throw createApiError(
        'getLastEloGamesForDate',
        `Failed to fetch ELO games for date: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getMatchupHistory(
    teamA: string,
    teamB: string,
    limit: number
  ): Promise<TeamSeasonGame[]> {
    try {
      return await getMatchupHistoryForTeam(teamA, teamB, limit)
    } catch (error) {
      throw createApiError(
        'getMatchupHistory',
        `Failed to fetch matchup history: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async countSeasonsCorrectPredictions(season: number): Promise<number> {
    try {
      return await countSeasonCorrectPredictions(season)
    } catch (error) {
      throw createApiError(
        'countSeasonsCorrectPredictions',
        `Failed to count correct predictions: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getAllGamePredictionsForSeason(
    season: number
  ): Promise<GamePrediction[]> {
    try {
      return await getAllGamePredictionsForSeason(season)
    } catch (error) {
      throw createApiError(
        'getAllGamePredictionsForSeason',
        `Failed to fetch season game predictions: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async countSeasonsGames(season: number): Promise<number> {
    try {
      return await countSeasonGames(season)
    } catch (error) {
      throw createApiError(
        'countSeasonsGames',
        `Failed to count season games: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

export const eloService = EloService.getInstance()
