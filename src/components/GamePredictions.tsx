'use client'

import React, { Suspense } from 'react'
import { formatDate } from '@/utils/time'
import { NHLGame, NHLGameWeek } from '@/types/game'
import { GamePrediction } from './GamePrediction'
import { PredictionsByDay } from './GamePredictions.server'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { groupPredictionsByDate } from '@/lib/predictions'
import {
  deserializePrediction,
  SerializedPrediction,
} from '@/utils/converters/prediction'
import { getPredictedWinnerFromPrediction } from '@/utils/prediction'
import { GameStatus, isLive } from '@/utils/game'
import { PlayIcon } from '@heroicons/react/24/solid'
import { useDisclosure } from '@heroui/react'
import { MatchupModal } from './MatchupModal'
import { Prediction } from '@/models/prediction'
import { Team } from '@/types/team'
import { getMatchupHistory, MatchupData } from '@/actions/matchup'

export type LiveGame = {
  [gameId: number]: { homeScore: number; awayScore: number; status: GameStatus }
}

interface GamePredictionsProps {
  scheduleData: NHLGameWeek
  predictions: SerializedPrediction[]
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedPrediction, setSelectedPrediction] =
    React.useState<Prediction | null>(null)
  const [selectedGame, setSelectedGame] = React.useState<NHLGame | null>(null)
  const [matchupData, setMatchupData] = React.useState<MatchupData | null>(null)
  const [isLoadingMatchup, setIsLoadingMatchup] = React.useState(false)

  const predictionsByDay = groupPredictionsByDate(
    predictions.map(deserializePrediction)
  )

  const allGames = scheduleData.gameWeek.flatMap((day) => day.games)

  const visibleDays = Object.keys(predictionsByDay)

  const visibleGames: PredictionsByDay = {}
  Object.entries(predictionsByDay).forEach(([day, predictions]) => {
    if (visibleDays.includes(day)) {
      visibleGames[day] = predictions
    }
  })

  return (
    <div className="my-4">
      <h2 className="text-2xl font-bold text-blue-400">
        Upcoming & Live Predictions
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        NHL game predictions are calculated automatically each night based on
        the latest team statistics and ratings. Only predictions for upcoming
        games (typically the next day) are shown, as new predictions are
        generated daily to reflect the most current data and match schedule.
      </p>
      <div className="space-y-6">
        {Object.entries(visibleGames).map(([day, predictions]) => {
          return (
            <div key={day} className="w-full">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                <Suspense key={isHydrated ? 'local' : 'utc'}>
                  <time dateTime={predictions[0].gameDate.toISOString()}>
                    {formatDate(predictions[0].gameDate)}
                  </time>
                </Suspense>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.map((prediction) => {
                  const game = allGames.find((g) => g.id === prediction.gameId)
                  if (!game) return null
                  const live = liveGames[prediction.gameId]
                  let predictionStatus = null

                  const predictedWinner =
                    getPredictedWinnerFromPrediction(prediction)

                  let actualWinner = null
                  if (live && live.status !== 'FUT') {
                    actualWinner =
                      live.homeScore > live.awayScore
                        ? prediction.homeTeam
                        : live.awayScore > live.homeScore
                          ? prediction.awayTeam
                          : null
                  }

                  // Show live prediction correctness
                  if (
                    live &&
                    live.status !== 'FINAL' &&
                    live.status !== 'OFF'
                  ) {
                    if (live.awayScore === live.homeScore) {
                      predictionStatus = (
                        <span className="text-yellow-500 font-bold text-sm">
                          Tied
                        </span>
                      )
                    } else {
                      predictionStatus = (
                        <span
                          className={`font-bold text-sm ${
                            actualWinner === predictedWinner
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          {actualWinner === predictedWinner
                            ? 'Correct so far'
                            : 'Incorrect so far'}
                        </span>
                      )
                    }
                  }
                  // Show final result and correctness
                  let finalStatus = null
                  if (
                    live &&
                    (live.status === 'FINAL' || live.status === 'OFF')
                  ) {
                    finalStatus = (
                      <span
                        className={`font-bold text-sm ${
                          actualWinner === predictedWinner
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {actualWinner === predictedWinner
                          ? 'Prediction Correct'
                          : 'Prediction Incorrect'}
                      </span>
                    )
                  }

                  if (live && live.status === 'FUT') {
                    predictionStatus = (
                      <span className="text-blue-400 font-semibold text-sm">
                        Not Started
                      </span>
                    )
                  }

                  const handleGameClick = async () => {
                    setSelectedGame(game)
                    setSelectedPrediction(prediction)
                    setMatchupData(null)
                    onOpen()

                    // Fetch matchup data asynchronously
                    setIsLoadingMatchup(true)
                    try {
                      const data = await getMatchupHistory(
                        game.awayTeam.abbrev,
                        game.homeTeam.abbrev,
                        5
                      )
                      setMatchupData(data)
                    } catch (error) {
                      console.error('Failed to fetch matchup data:', error)
                    } finally {
                      setIsLoadingMatchup(false)
                    }
                  }

                  return (
                    <div
                      key={prediction.gameId}
                      aria-label={`game prediction for ${game.homeTeam.abbrev} vs ${game.awayTeam.abbrev}`}
                      className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg border border-slate-700/50 hover:border-blue-500/50 hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden"
                      onClick={handleGameClick}
                    >
                      <GamePrediction prediction={prediction} game={game} />
                      {live && (
                        <div className="px-4 pb-3 pt-2 border-t border-slate-700 bg-slate-800/40">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {isLive(live.status) && (
                                <span className="flex items-center gap-1 text-red-500">
                                  <PlayIcon className="size-4 animate-pulse" />
                                  <span className="text-xs font-semibold">
                                    LIVE
                                  </span>
                                </span>
                              )}
                              {!isLive(live.status) && (
                                <span className="text-xs text-gray-400">
                                  {live.status}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-3 items-center text-sm">
                              <span className="font-semibold">
                                {game.awayTeam.abbrev}{' '}
                                <span className="text-lg text-blue-400">
                                  {live.awayScore}
                                </span>
                              </span>
                              <span className="text-gray-500">-</span>
                              <span className="font-semibold">
                                {game.homeTeam.abbrev}{' '}
                                <span className="text-lg text-blue-400">
                                  {live.homeScore}
                                </span>
                              </span>
                            </div>
                          </div>
                          {(predictionStatus || finalStatus) && (
                            <div className="mt-2 flex justify-center">
                              {predictionStatus}
                              {finalStatus}
                            </div>
                          )}
                        </div>
                      )}
                      {!live && finalStatus && (
                        <div className="px-4 pb-3 pt-2 border-t border-slate-700 bg-slate-800/40 flex justify-center">
                          {finalStatus}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <MatchupModal
        open={isOpen}
        onClose={onClose}
        prediction={selectedPrediction}
        game={selectedGame}
        matchupData={matchupData}
        teams={teams}
        isLoading={isLoadingMatchup}
      />
    </div>
  )
}
