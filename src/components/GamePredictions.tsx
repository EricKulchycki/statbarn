'use client'

import { ELOCalculationResult } from '@/lib/eloCalculator'
import React, { useState } from 'react'
import { formatDate } from '@/utils/time'
import { GamePredictionsMap } from '@/services/predictions.service'
import { NHLGameWeek } from '@/types/game'
import { GamePrediction } from './GamePrediction'
import { ShowAll } from './ShowAll'

type PredictionsByDay = { [day: string]: ELOCalculationResult[] }

interface GamePredictionsProps {
  scheduleData: NHLGameWeek
  upcomingPredictions: GamePredictionsMap
}

export const GamePredictions: React.FC<GamePredictionsProps> = ({
  scheduleData,
  upcomingPredictions,
}) => {
  const [showAll, setShowAll] = useState(false)

  const predictionsByDay: PredictionsByDay = {}
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

  const visibleDays = showAll
    ? Object.keys(predictionsByDay)
    : Object.keys(predictionsByDay).slice(0, 2)

  const visibleGames: PredictionsByDay = {}
  Object.entries(predictionsByDay).forEach(([day, predictions]) => {
    if (visibleDays.includes(day)) {
      visibleGames[day] = predictions
    }
  })

  return (
    <div className="lg:col-span-2 my-4">
      <h2 className="text-lg font-bold">Upcoming Games & Predictions</h2>
      <div className="flex flex-wrap gap-4 w-full my-4">
        {Object.entries(visibleGames).map(([day, predictions]) => {
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
      <ShowAll showAll={showAll} setShowAll={setShowAll} />
    </div>
  )
}
