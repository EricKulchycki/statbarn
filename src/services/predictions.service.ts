import {
  calculateGameELO,
  ELOCalculationResult,
  ELOsByTeam,
} from '@/lib/eloCalculator'
import { Prediction, PredictionModel } from '@/models/prediction'
import { NHLGame, NHLGameWeek } from '@/types/game'
import { eloService } from './elo.service'
import { scheduleService } from './schedule.service'
import { toPredictionDomain } from '@/utils/converters/prediction'

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

  async getUpcomingGamePredictions(
    scheduleData: NHLGameWeek
  ): Promise<Prediction[]> {
    // Collect all gameIds for the week
    const gameIds: number[] = []
    for (const day of scheduleData.gameWeek) {
      for (const game of day.games) {
        gameIds.push(game.id)
      }
    }

    // Fetch all predictions for these gameIds from the DB
    const predictions = await PredictionModel.find({
      gameId: { $in: gameIds },
    }).exec()

    return predictions.map(toPredictionDomain)
  }

  async createPredictionForGame(game: NHLGame, latestElos: ELOsByTeam) {
    return calculateGameELO(game, latestElos)
  }

  async createNextDayPredictions() {
    const tomorrow = this.getTodayDateString()

    // 1. Get tomorrow's games
    const gameWeek = await scheduleService.getScheduleByDate(tomorrow)
    const games = gameWeek.gameWeek[0]?.games || []

    // 2. Get latest ELOs for all teams
    const latestElos = await eloService.getLatestElos()
    const eloMap = Object.fromEntries(latestElos.map((e) => [e.abbrev, e.elo]))

    for (const game of games) {
      // 3. Calculate prediction using ELO logic
      const { prediction } = await calculateGameELO(game, eloMap)

      // 4. Save prediction to DB
      await PredictionModel.findOneAndUpdate(
        { gameId: prediction.gameId },
        prediction,
        { upsert: true, new: true }
      )
    }
  }

  private getTodayDateString(): string {
    const tomorrow = new Date().getTime()
    return new Date(tomorrow).toISOString().slice(0, 10)
  }
}

// Export singleton instance
export const predictionsService = PredictionsService.getInstance()
