import { scheduleService } from '@/services/schedule.service'
import { GamePredictions } from './GamePredictions'
import { predictionsService } from '@/services/predictions.service'
import { Prediction } from '@/models/prediction'
import { serializePrediction } from '@/utils/converters/prediction'
import { gameService } from '@/services/game.service'
import { getYesterdayDate } from '@/utils/currentSeason'

export type PredictionsByDay = { [day: string]: Prediction[] }

export async function fetchLiveGamesForClient() {
  const todaysGames = await gameService.getGamesByDate(
    getYesterdayDate().toISOString().slice(0, 10)
  )
  const map: {
    [gameId: number]: { homeScore: number; awayScore: number; status: string }
  } = {}
  for (const g of todaysGames) {
    map[g.id] = {
      homeScore: g.homeTeam.score,
      awayScore: g.awayTeam.score,
      status: g.gameState,
    }
  }
  return map
}

export async function GamePredictionsWrapper() {
  const currentSchedule = await scheduleService.getCurrentSchedule()
  const upcomingPredictions =
    await predictionsService.getUpcomingGamePredictions(currentSchedule)
  const liveGames = await fetchLiveGamesForClient()

  return (
    <GamePredictions
      scheduleData={currentSchedule}
      predictions={upcomingPredictions.map(serializePrediction)}
      liveGames={liveGames}
    />
  )
}
