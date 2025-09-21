import { scheduleService } from '@/services/schedule.service'
import { GamePredictions } from './GamePredictions'
import { predictionsService } from '@/services/predictions.service'
import { Prediction } from '@/models/prediction'
import { serializePrediction } from '@/utils/converters/prediction'

export type PredictionsByDay = { [day: string]: Prediction[] }

export async function GamePredictionsWrapper() {
  const currentSchedule = await scheduleService.getCurrentSchedule()

  const upcomingPredictions =
    await predictionsService.getUpcomingGamePredictions(currentSchedule)

  return (
    <GamePredictions
      scheduleData={currentSchedule}
      predictions={upcomingPredictions.map(serializePrediction)}
    />
  )
}
