import React from 'react'
import { formatPercentage } from 'utils/percentage'
import { GamePredictionsMap } from '~/services/predictions.service'
import { NHLGameWeek } from '~/types/game'

interface GamePredictionsProps {
  scheduleData: NHLGameWeek
  upcomingPredictions: GamePredictionsMap
}

export const GamePredictions: React.FC<GamePredictionsProps> = ({
  scheduleData,
  upcomingPredictions,
}) => {
  return (
    <div className="upcoming-schedule">
      <h2>Upcoming Games & Predictions</h2>
      <ul>
        {scheduleData.gameWeek.map((game) => {
          return game.games.map((subGame) => {
            const prediction = upcomingPredictions[subGame.id]
            return (
              <li key={subGame.id} className="game-item">
                <div>
                  <strong>
                    {subGame.awayTeam.abbrev} @ {subGame.homeTeam.abbrev}
                  </strong>
                  <span>
                    {' '}
                    — {new Date(subGame.startTimeUTC).toLocaleString()}
                  </span>
                  {subGame.venue && <span> — {subGame.venue.default}</span>}
                </div>
                {prediction && (
                  <div className="prediction">
                    <strong>Prediction:</strong>{' '}
                    {prediction.prediction.predictedWinner ===
                    subGame.homeTeam.abbrev
                      ? `${subGame.homeTeam.abbrev} to win`
                      : `${subGame.awayTeam.abbrev} to win`}{' '}
                    (Home:{' '}
                    {formatPercentage(
                      prediction.prediction.homeTeamWinProbability
                    )}
                    , Away:{' '}
                    {formatPercentage(
                      prediction.prediction.awayTeamWinProbability
                    )}
                    )
                  </div>
                )}
              </li>
            )
          })
        })}
      </ul>
    </div>
  )
}
