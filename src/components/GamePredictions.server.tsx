import { scheduleService } from '@/services/schedule.service'
import { GamePredictions } from './GamePredictions'
import { predictionsService } from '@/services/predictions.service'
import { deserializeELOCalculationResults } from '@/utils/converters/gamePredictionsMap'

export async function GamePredictionsWrapper() {
  const currentSchedule = await scheduleService.getCurrentSchedule()

  const upcomingPredictions =
    await predictionsService.getUpcomingGamePredictions(currentSchedule)

  return (
    <GamePredictions
      scheduleData={currentSchedule}
      upcomingPredictions={deserializeELOCalculationResults(
        upcomingPredictions
      )}
    />
  )
}
