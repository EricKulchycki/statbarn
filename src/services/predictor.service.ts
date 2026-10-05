import type {
  PredictionInput,
  PredictionOutput,
} from '@statbarn/prediction-core'
import { predictGame } from '@statbarn/prediction-core'

export type { PredictionInput, PredictionOutput }

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
    return predictGame(input)
  }
}

export const predictorService = PredictorService.getInstance()
