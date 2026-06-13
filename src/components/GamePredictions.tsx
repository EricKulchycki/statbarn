'use client'

import { useIsHydrated } from '@/hooks/useIsHydrated'
import { groupPredictionsByDate } from '@/lib/predictions'
import { NHLGame, NHLGameWeek } from '@/types/game'
import {
  GamePrediction,
  GamePredictionSerialized,
  deserializeGamePrediction,
} from '@/types/gamePrediction'
import { Team } from '@/types/team'
import { toScheduleRowFromPrediction } from '@/utils/gameSchedule'
import { formatDate } from '@/utils/time'
import React, { Suspense } from 'react'
import { LiveGame } from './GamePredictions.types'
import { GameScheduleTable } from './GameScheduleTable'

export type { LiveGame } from './GamePredictions.types'

interface GamePredictionsProps {
  scheduleData: NHLGameWeek
  predictions: GamePredictionSerialized[]
  liveGames: LiveGame
  teams: Team[]
}

export const GamePredictions: React.FC<GamePredictionsProps> = ({
  scheduleData,
  predictions,
  liveGames,
  teams,
}) => {
  const isHydrated = useIsHydrated()

  const deserializedPredictions = predictions.map(deserializeGamePrediction)
  const predictionsByDay = groupPredictionsByDate(deserializedPredictions)
  const allGames = scheduleData.gameWeek.flatMap((day) => day.games)

  const gamesById = new Map<number, NHLGame>(allGames.map((g) => [g.id, g]))
  const predictionsById = new Map<number, GamePrediction>(
    deserializedPredictions.map((p) => [p.gameId, p])
  )

  const visibleDays = Object.keys(predictionsByDay)

  if (visibleDays.length === 0) {
    return (
      <section className="my-4">
        <h2 className="text-lg font-semibold text-slate-200 mb-2">Today</h2>
        <p className="text-sm text-gray-400">
          No upcoming predictions. The season may be complete — see{' '}
          <a href="/model-confidence" className="text-blue-400 underline">
            model confidence
          </a>{' '}
          for the full record.
        </p>
      </section>
    )
  }

  return (
    <section className="my-4">
      <h2 className="text-lg font-semibold text-slate-200 mb-4">Today</h2>
      <div className="space-y-6">
        {Object.entries(predictionsByDay).map(([day, dayPredictions]) => {
          const rows = dayPredictions
            .map((prediction) => {
              const game = gamesById.get(prediction.gameId)
              if (!game) return null
              const live = liveGames[prediction.gameId]
              return toScheduleRowFromPrediction(prediction, game, live)
            })
            .filter((row): row is NonNullable<typeof row> => row !== null)

          const showDayHeader = visibleDays.length > 1

          return (
            <div key={day} className="w-full">
              {showDayHeader && (
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  <Suspense key={isHydrated ? 'local' : 'utc'}>
                    <time dateTime={dayPredictions[0].gameDate.toISOString()}>
                      {formatDate(dayPredictions[0].gameDate)}
                    </time>
                  </Suspense>
                </h3>
              )}
              <GameScheduleTable
                rows={rows}
                teams={teams}
                gamesById={gamesById}
                predictionsById={predictionsById}
                interactive
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
