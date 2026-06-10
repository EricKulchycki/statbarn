import { scheduleService } from '@/services/schedule.service'
import { GamePredictions } from './GamePredictions'
import { LiveGame } from './GamePredictions.types'
import { predictionsService } from '@/services/predictions.service'
import { Prediction } from '@/models/prediction'
import { serializePrediction } from '@/utils/converters/prediction'
import { DateTime } from 'luxon'
import { getTimezoneFromCookie } from '@/lib/time'
import { NHLGameWeek } from '@/types/game'
import { getTeams } from '@/data/teams'

export type PredictionsByDay = { [day: string]: Prediction[] }

function buildLiveGamesFromSchedule(
  schedule: NHLGameWeek,
  todayIso: string
): LiveGame {
  const map: LiveGame = {}

  for (const day of schedule.gameWeek) {
    if (day.date !== todayIso) continue
    for (const game of day.games) {
      map[game.id] = {
        homeScore: game.homeTeam.score,
        awayScore: game.awayTeam.score,
        status: game.gameState,
      }
    }
  }

  return map
}

export async function GamePredictionsWrapper() {
  const localTimezone = await getTimezoneFromCookie()

  const localDate = DateTime.now().setZone(localTimezone).toISODate() ?? ''

  const [currentSchedule, teams] = await Promise.all([
    scheduleService.getScheduleByDate(localDate),
    getTeams(),
  ])

  const liveGames = buildLiveGamesFromSchedule(currentSchedule, localDate)

  const upcomingPredictions =
    await predictionsService.getUpcomingGamePredictions(currentSchedule)

  return (
    <GamePredictions
      scheduleData={currentSchedule}
      predictions={upcomingPredictions.map(serializePrediction)}
      liveGames={liveGames}
      teams={teams}
    />
  )
}
