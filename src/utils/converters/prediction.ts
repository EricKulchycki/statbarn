import { Prediction, PredictionDocument } from '@/models/prediction'

// Convert Mongoose PredictionDocument to domain Prediction type
export function toPredictionDomain(doc: PredictionDocument): Prediction {
  return {
    gameId: doc.gameId,
    homeTeam: doc.homeTeam,
    awayTeam: doc.awayTeam,
    homeTeamWinProbability: doc.homeTeamWinProbability,
    awayTeamWinProbability: doc.awayTeamWinProbability,
    predictedWinner: doc.predictedWinner,
    gameDate: doc.gameDate,
    modelVersion: doc.modelVersion,
    result: doc.result
      ? {
          homeTeamScore: doc.result.homeTeamScore,
          awayTeamScore: doc.result.awayTeamScore,
          winner: doc.result.winner,
          correctPrediction: doc.result.correctPrediction,
        }
      : undefined,
  }
}

export interface SerializedPrediction extends Omit<Prediction, 'gameDate'> {
  gameDate: string // ISO string representation of the date
}

export function serializePrediction(
  prediction: Prediction
): SerializedPrediction {
  return {
    ...prediction,
    gameDate:
      prediction.gameDate instanceof Date
        ? prediction.gameDate.toISOString()
        : prediction.gameDate,
  }
}

export function deserializePrediction(data: SerializedPrediction): Prediction {
  return {
    ...data,
    gameDate:
      typeof data.gameDate === 'string'
        ? new Date(data.gameDate)
        : data.gameDate,
  }
}
