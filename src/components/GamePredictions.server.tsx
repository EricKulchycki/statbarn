import { scheduleService } from '@/services/schedule.service'
import { GamePredictions } from './GamePredictions'
import { predictionsService } from '@/services/predictions.service'
import { Prediction } from '@/models/prediction'
import { serializePrediction } from '@/utils/converters/prediction'
import { gameService } from '@/services/game.service'
import { DateTime } from 'luxon'
import { getTimezoneFromCookie } from '@/lib/time'
import { NHLGame } from '@/types/game'
import { getTeams } from '@/data/teams'
import { GameStatus } from '@/utils/game'

export type PredictionsByDay = { [day: string]: Prediction[] }

export async function fetchLiveGamesForClient() {
  const today = DateTime.now().minus({ hours: 8 })

  let todaysGames: NHLGame[] = []
  try {
    todaysGames = await gameService.getGamesByDate(today.toISODate())
  } catch (error) {
    console.error('Error fetching today games for live updates:', error)
  }
  const map: {
    [gameId: number]: {
      homeScore: number
      awayScore: number
      status: GameStatus
    }
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
  const localTimezone = await getTimezoneFromCookie()

  const localDate = DateTime.now().setZone(localTimezone).toISODate()

  // Gets the game week from the NHL API, which includes all games for the current week
  const currentSchedule = await scheduleService.getScheduleByDate(
    localDate ?? ''
  )
  // console.log('Current Schedule:', currentSchedule)

  const upcomingPredictions =
    await predictionsService.getUpcomingGamePredictions(currentSchedule)

  const liveGames = await fetchLiveGamesForClient()
  const teams = await getTeams()

  return (
    <GamePredictions
      scheduleData={currentSchedule}
      predictions={upcomingPredictions.map(serializePrediction)}
      liveGames={liveGames}
      teams={teams}
    />
  )
}
