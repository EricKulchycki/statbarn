import { Prediction } from '@/models/prediction'

export const getPredictedWinnerFromPrediction = (prediction: Prediction) => {
  return prediction.homeTeamWinProbability > prediction.awayTeamWinProbability
    ? prediction.homeTeam
    : prediction.awayTeam
}
