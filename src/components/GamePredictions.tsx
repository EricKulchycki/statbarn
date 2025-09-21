'use client'

import React, { Suspense, useState } from 'react'
import { formatDate } from '@/utils/time'
import { NHLGameWeek } from '@/types/game'
import { GamePrediction } from './GamePrediction'
import { ShowAll } from './ShowAll'
import { PredictionsByDay } from './GamePredictions.server'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { groupPredictionsByDate } from '@/lib/predictions'
import {
  deserializePrediction,
  SerializedPrediction,
} from '@/utils/converters/prediction'

interface GamePredictionsProps {
  scheduleData: NHLGameWeek
  predictions: SerializedPrediction[]
}

export const GamePredictions: React.FC<GamePredictionsProps> = ({
  scheduleData,
  predictions,
}) => {
  const isHydrated = useIsHydrated()

  const predictionsByDay = groupPredictionsByDate(
    predictions.map(deserializePrediction)
  )

  const allGames = scheduleData.gameWeek.flatMap((day) => day.games)

  const visibleDays = Object.keys(predictionsByDay).slice(0, 2)

  const visibleGames: PredictionsByDay = {}
  Object.entries(predictionsByDay).forEach(([day, predictions]) => {
    if (visibleDays.includes(day)) {
      visibleGames[day] = predictions
    }
  })

  return (
    <div className="lg:col-span-2 my-4">
      <h2 className="text-lg font-bold">Tomorrows Predictions</h2>
      <p className="text-sm text-gray-400">
        NHL game predictions are calculated automatically each night based on
        the latest team statistics and ratings. Only predictions for upcoming
        games (typically the next day) are shown, as new predictions are
        generated daily to reflect the most current data and match schedule.
      </p>
      <div className="flex flex-wrap gap-4 w-full my-4">
        {Object.entries(visibleGames).map(([day, predictions]) => {
          return (
            <div key={day} className="w-full">
              <h3 className="text-md font-semibold">
                <Suspense key={isHydrated ? 'local' : 'utc'}>
                  <time dateTime={predictions[0].gameDate.toISOString()}>
                    {formatDate(predictions[0].gameDate)}
                  </time>
                </Suspense>
              </h3>
              <div className="flex flex-wrap gap-4 py-2">
                {predictions.map((prediction) => {
                  const game = allGames.find((g) => g.id === prediction.gameId)
                  if (!game) return null
                  return (
                    <GamePrediction
                      key={prediction.gameId}
                      prediction={prediction}
                      game={game}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
