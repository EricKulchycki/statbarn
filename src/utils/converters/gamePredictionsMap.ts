import { GamePredictionsMap } from '@/services/predictions.service'

export function deserializeELOCalculationResults(
  data: GamePredictionsMap
): GamePredictionsMap {
  const result: GamePredictionsMap = {}
  for (const [gameId, value] of Object.entries(data)) {
    result[Number(gameId)] = {
      ...value,
      prediction: {
        ...value.prediction,
        gameDate: new Date(value.prediction.gameDate),
      },
      gameElo: {
        ...value.gameElo,
        gameDate: new Date(value.gameElo.gameDate),
      },
    }
  }
  return result
}
