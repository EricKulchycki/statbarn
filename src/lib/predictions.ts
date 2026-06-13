import { GamePrediction } from '@/types/gamePrediction'

export function groupPredictionsByDate(predictions: GamePrediction[]) {
  const map: { [date: string]: GamePrediction[] } = {}
  for (const pred of predictions) {
    const localDate = new Date(pred.gameDate).toString().slice(0, 10)
    if (!map[localDate]) map[localDate] = []
    map[localDate].push(pred)
  }
  return map
}
