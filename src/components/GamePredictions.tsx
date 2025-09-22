'use client'

import React, { Suspense } from 'react'
import { formatDate } from '@/utils/time'
import { NHLGameWeek } from '@/types/game'
import { GamePrediction } from './GamePrediction'
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
  liveGames: {
    [gameId: number]: { homeScore: number; awayScore: number; status: string }
  }
}

export const GamePredictions: React.FC<GamePredictionsProps> = ({
  scheduleData,
  predictions,
  liveGames,
}) => {
  const isHydrated = useIsHydrated()

  const predictionsByDay = groupPredictionsByDate(
    predictions.map(deserializePrediction)
  )

  const allGames = scheduleData.gameWeek.flatMap((day) => day.games)

  const visibleDays = Object.keys(predictionsByDay)
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, 1)

  const visibleGames: PredictionsByDay = {}
  Object.entries(predictionsByDay).forEach(([day, predictions]) => {
    if (visibleDays.includes(day)) {
      visibleGames[day] = predictions
    }
  })

  return (
    <div className="my-4">
      <h2 className="text-lg font-bold">Upcoming & Live Predictions</h2>
      <p className="text-sm text-gray-400">
        NHL game predictions are calculated automatically each night based on
        the latest team statistics and ratings. Only predictions for upcoming
        games (typically the next day) are shown, as new predictions are
        generated daily to reflect the most current data and match schedule.
      </p>
      <div className="flex flex-wrap gap-2 w-full my-4 justify-center">
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
                  const live = liveGames[prediction.gameId]
                  let predictionStatus = null

                  const predictedWinner =
                    prediction.homeTeamWinProbability >
                    prediction.awayTeamWinProbability
                      ? prediction.homeTeam
                      : prediction.awayTeam

                  const actualWinner =
                    live.homeScore > live.awayScore
                      ? prediction.homeTeam
                      : live.awayScore > live.homeScore
                        ? prediction.awayTeam
                        : null

                  // Show live prediction correctness
                  if (live && live.status !== 'FINAL') {
                    predictionStatus = (
                      <span
                        className={
                          actualWinner === predictedWinner
                            ? 'text-green-500 font-bold'
                            : 'text-red-500 font-bold'
                        }
                      >
                        {actualWinner === predictedWinner
                          ? 'Correct so far'
                          : 'Incorrect so far'}
                      </span>
                    )
                  }
                  // Show final result and correctness
                  let finalStatus = null
                  if (live && live.status === 'FINAL') {
                    finalStatus = (
                      <span
                        className={
                          actualWinner === predictedWinner
                            ? 'text-green-500 font-bold'
                            : 'text-red-500 font-bold'
                        }
                      >
                        {actualWinner === predictedWinner
                          ? 'Prediction Correct'
                          : 'Prediction Incorrect'}
                      </span>
                    )
                  }
                  return (
                    <div key={prediction.gameId} className="flex-1 p-2">
                      <div className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-2 flex flex-col items-center">
                        <GamePrediction prediction={prediction} game={game} />
                        {live && (
                          <div className="mt-1 text-xs flex flex-col items-center gap-2">
                            <span className="ml-2 text-gray-400">
                              ({live.status})
                            </span>
                            <div className="flex gap-2 items-center">
                              <span className=" rounded px-2 py-1">
                                {game.awayTeam.abbrev}{' '}
                                <span className="font-bold">
                                  {live.awayScore}
                                </span>
                              </span>
                              <span className="mx-1">vs</span>
                              <span className="rounded px-2 py-1">
                                {game.homeTeam.abbrev}{' '}
                                <span className="font-bold">
                                  {live.homeScore}
                                </span>
                              </span>
                            </div>
                            {predictionStatus && (
                              <span className="ml-2">{predictionStatus}</span>
                            )}
                            {finalStatus && (
                              <span className="ml-2">{finalStatus}</span>
                            )}
                          </div>
                        )}
                        {!live && finalStatus && (
                          <div className="mt-1 text-xs flex flex-col items-center">
                            {finalStatus}
                          </div>
                        )}
                      </div>
                    </div>
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
