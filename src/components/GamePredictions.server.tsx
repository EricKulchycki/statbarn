import { scheduleService } from '@/services/schedule.service'
import { GamePredictions } from './GamePredictions'
import { predictionsService } from '@/services/predictions.service'
import { ELOCalculationResult } from '@/lib/eloCalculator'

export type PredictionsByDay = { [day: string]: ELOCalculationResult[] }

export async function GamePredictionsWrapper() {
  const currentSchedule = await scheduleService.getCurrentSchedule()

  const upcomingPredictions =
    await predictionsService.getUpcomingGamePredictions(currentSchedule)

  const predictionsByDay: PredictionsByDay = {}

  for (const game of currentSchedule.gameWeek) {
    for (const subGame of game.games) {
      const prediction = upcomingPredictions[subGame.id]
      if (prediction) {
        const gameDate = new Date(subGame.startTimeUTC).toDateString()
        if (!predictionsByDay[gameDate]) {
          predictionsByDay[gameDate] = []
        }
        predictionsByDay[gameDate].push(prediction)
      }
    }
  }

  return (
    <GamePredictions
      scheduleData={currentSchedule}
      predictionsByDay={predictionsByDay}
    />
  )
}
