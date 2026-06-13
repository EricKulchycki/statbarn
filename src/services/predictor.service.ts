import { ELO_CONFIG } from '@/constants'

export interface PredictionInput {
  homeAbbrev: string
  awayAbbrev: string
  homeElo: number
  awayElo: number
  matchupFactor?: { homeFactor: number; awayFactor: number }
}

export interface PredictionOutput {
  homeWinProbability: number
  awayWinProbability: number
  predictedWinner: string
}

export class PredictorService {
  private static instance: PredictorService

  private constructor() {}

  public static getInstance(): PredictorService {
    if (!PredictorService.instance) {
      PredictorService.instance = new PredictorService()
    }
    return PredictorService.instance
  }

  predictGame(input: PredictionInput): PredictionOutput {
    const {
      homeAbbrev,
      awayAbbrev,
      homeElo,
      awayElo,
      matchupFactor = { homeFactor: 0, awayFactor: 0 },
    } = input

    const homeAdj =
      homeElo + ELO_CONFIG.homeAdvantage + matchupFactor.homeFactor
    const awayAdj = awayElo + matchupFactor.awayFactor
    const ratingDiff = awayAdj - homeAdj
    const homeWinProbability = 1 / (1 + Math.pow(10, ratingDiff / 400))
    const awayWinProbability = 1 - homeWinProbability

    return {
      homeWinProbability,
      awayWinProbability,
      predictedWinner: homeWinProbability >= 0.5 ? homeAbbrev : awayAbbrev,
    }
  }
}

export const predictorService = PredictorService.getInstance()
