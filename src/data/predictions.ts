import { Prediction, PredictionModel } from '@/models/prediction'

export async function getPredictions(date: Date): Promise<Prediction[]> {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const predictions = await PredictionModel.find({
    gameDate: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  }).exec()

  return predictions.map((prediction) => ({
    gameId: prediction.gameId,
    homeTeamWinProbability: prediction.homeTeamWinProbability,
    awayTeamWinProbability: prediction.awayTeamWinProbability,
    gameDate: prediction.gameDate,
    predictedWinner: prediction.predictedWinner,
    result: prediction.result,
    modelVersion: prediction.modelVersion,
    homeTeam: prediction.homeTeam,
    awayTeam: prediction.awayTeam,
  }))
}
