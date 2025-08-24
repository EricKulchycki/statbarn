import {
  calculateGameELO,
  ELOCalculationResult,
  TeamELOState,
} from 'lib/eloCalculator'
import { Prediction } from 'models/prediction'
import { createApiError } from '~/types/errors'
import { NHLGame, NHLGameWeek } from '~/types/game'
import { eloService } from './elo.service'

export type GamePredictionsMap = { [gameId: number]: ELOCalculationResult }

export class PredictionsService {
  private static instance: PredictionsService

  private constructor() {}

  public static getInstance(): PredictionsService {
    if (!PredictionsService.instance) {
      PredictionsService.instance = new PredictionsService()
    }
    return PredictionsService.instance
  }

  async getPredictionsByDate(date: Date): Promise<Prediction[]> {
    try {
      // Implement logic to fetch predictions for a given date
      // Example: return await PredictionModel.find({ gameDate: date }).exec()
      return []
    } catch (error) {
      throw createApiError(
        'getPredictionsByDate',
        `Failed to fetch predictions for date ${date.toISOString()}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getUpcomingGamePredictions(
    scheduleData: NHLGameWeek
  ): Promise<GamePredictionsMap> {
    const latestElos = await eloService.getLatestElos()
    const TeamELOState: TeamELOState = {}
    for (const teamElo of latestElos) {
      TeamELOState[teamElo.abbrev] = teamElo.elo
    }

    const gamePredictions: GamePredictionsMap = {}
    for (const day of scheduleData.gameWeek) {
      for (const game of day.games) {
        const prediction = await this.createPredictionForGame(
          game,
          TeamELOState
        )
        gamePredictions[game.id] = prediction
      }
    }

    return gamePredictions
  }

  async createPredictionForGame(game: NHLGame, latestElos: TeamELOState) {
    const gameELO = calculateGameELO(game, latestElos)

    return gameELO
  }

  async savePrediction(prediction: Prediction): Promise<Prediction> {
    try {
      // Implement logic to save a new prediction
      // Example: return await PredictionModel.create(prediction)
      return prediction
    } catch (error) {
      throw createApiError(
        'savePrediction',
        `Failed to save prediction: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getPredictionsForGame(gameId: number): Promise<Prediction[]> {
    try {
      // Implement logic to fetch predictions for a specific game
      // Example: return await PredictionModel.find({ gameId }).exec()
      return []
    } catch (error) {
      throw createApiError(
        'getPredictionsForGame',
        `Failed to fetch predictions for game ${gameId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private getYesterdayDateString(): string {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }

  private getTomorrowDateString(): string {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }
}

// Export singleton instance
export const predictionsService = PredictionsService.getInstance()
