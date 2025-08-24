import { ELOCalculationResult } from 'lib/eloCalculator'
import React from 'react'
import { formatPercentage } from 'utils/percentage'
import { formatDate } from 'utils/time'
import { GamePredictionsMap } from '~/services/predictions.service'
import { NHLGame, NHLGameWeek } from '~/types/game'

interface GamePredictionsProps {
  scheduleData: NHLGameWeek
  upcomingPredictions: GamePredictionsMap
}

export const GamePredictions: React.FC<GamePredictionsProps> = ({
  scheduleData,
  upcomingPredictions,
}) => {
  const predictionsByDay: { [day: string]: ELOCalculationResult[] } = {}
  for (const game of scheduleData.gameWeek) {
    for (const subGame of game.games) {
      const prediction = upcomingPredictions[subGame.id]
      if (prediction) {
        const gameDate = new Date(subGame.startTimeUTC).toLocaleDateString()
        if (!predictionsByDay[gameDate]) {
          predictionsByDay[gameDate] = []
        }
        predictionsByDay[gameDate].push(prediction)
      }
    }
  }

  const allGames = scheduleData.gameWeek.flatMap((day) => day.games)

  return (
    <div className="lg:col-span-2 my-4">
      <h2 className="text-lg font-bold">Upcoming Games & Predictions</h2>
      <div className="flex flex-wrap gap-4 w-full my-4">
        {Object.entries(predictionsByDay).map(([day, predictions]) => {
          return (
            <div key={day} className="w-full">
              <h3 className="text-md font-semibold">{formatDate(day)}</h3>
              <div className="flex flex-wrap gap-4 py-2">
                {predictions.map((prediction) => {
                  const game = allGames.find(
                    (g) => g.id === prediction.prediction.gameId
                  )
                  if (!game) return null
                  return (
                    <GamePrediction
                      key={prediction.prediction.gameId}
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

interface GamePredictionProps {
  game: NHLGame
  prediction?: ELOCalculationResult
}

const GamePrediction = (props: GamePredictionProps) => {
  const { game, prediction } = props

  return (
    <div key={game.id} className="rounded-lg p-4 bg-slate-800">
      <div className="text-sm text-gray-400 mb-2">
        {new Date(game.startTimeUTC).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
      <div className="font-semibold flex items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <img
              alt="home team logo"
              src={game.awayTeam.logo}
              className="h-8 w-8"
            />
            {game.awayTeam.abbrev}
          </div>
          <div
            className={`${
              prediction?.prediction.predictedWinner === game.awayTeam.abbrev
                ? 'text-green-400'
                : 'text-gray-500'
            }`}
          >
            {formatPercentage(
              prediction?.prediction.awayTeamWinProbability || 0
            )}
          </div>
        </div>
        <div className="mx-2 mt-1 text-gray-500">@</div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            {game.homeTeam.abbrev}
            <img
              alt="away team logo"
              src={game.homeTeam.logo}
              className="h-8 w-8"
            />
          </div>
          <div
            className={`${
              prediction?.prediction.predictedWinner === game.homeTeam.abbrev
                ? 'text-green-400'
                : 'text-gray-500'
            }`}
          >
            {formatPercentage(
              prediction?.prediction.homeTeamWinProbability || 0
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
