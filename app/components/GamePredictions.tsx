import { NHLGame, NHLGameDay } from '~/types/game'
import { Live } from './Live'
import { Prediction } from 'models/prediction'
import { calculateGamePrediction } from 'lib/predictions'
import { LatestELO } from '~/data/latest-elo.get'

interface GamePredictionsProps {
  dayLabel: string
  todaysGames: NHLGameDay
  elos: LatestELO[]
  predictions?: Prediction[]
}

function GamePredictions({
  dayLabel,
  todaysGames,
  elos,
  predictions = [],
}: GamePredictionsProps) {
  if (!todaysGames.games.length) {
    return <p>No games scheduled for today.</p>
  }

  const getGamePrediction = (game: NHLGame) => {
    if (predictions.length > 0) {
      const prediction = predictions.find(
        (prediction) => prediction.gameId === game.id
      )
      console.log({
        home: prediction?.homeTeamWinProbability,
        away: prediction?.awayTeamWinProbability,
      })
      return {
        homeWinProbability: prediction?.homeTeamWinProbability || 0,
        awayWinProbability: prediction?.awayTeamWinProbability || 0,
      }
    }
    return calculateGamePrediction(elos, game)
  }

  return (
    <div className="p-4 m-8 max-h-fit">
      <h2 className="text-lg font-semibold mb-4">
        Game Predictions for {dayLabel}
      </h2>
      <div className="flex flex-col gap-3">
        {todaysGames.games.map((game) => {
          const { homeWinProbability, awayWinProbability } =
            getGamePrediction(game)

          const lossClassName = 'border-b-red-600 border-b-2 pb-1'
          const winClassName = 'border-b-green-600 border-b-2 pb-1'

          let predictionCorrect = false
          if (homeWinProbability > awayWinProbability) {
            predictionCorrect = game.homeTeam.score > game.awayTeam.score
          } else {
            predictionCorrect = game.awayTeam.score > game.homeTeam.score
          }

          const border = predictionCorrect
            ? 'border-green-600 border-2'
            : 'border-red-600 border-2'

          const isGameOver = new Date(game.startTimeUTC) < new Date()

          const isLive = game.gameState === 'LIVE'

          return (
            <div
              key={`${game.homeTeam.abbrev}-${game.awayTeam.abbrev}`}
              className={`bg-gray-800 p-2 rounded-xl ${isGameOver ? border : ''}`}
            >
              <div className="flex items-center justify-around">
                <div
                  className={
                    awayWinProbability > homeWinProbability
                      ? winClassName
                      : lossClassName
                  }
                >
                  <img
                    className="size-8"
                    src={game.awayTeam.logo}
                    alt={`${game.awayTeam.abbrev} logo`}
                  />
                  <p>{(awayWinProbability * 100).toFixed(0)}%</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p>@</p>
                  {isLive && <Live />}
                </div>
                <div
                  className={
                    homeWinProbability > awayWinProbability
                      ? winClassName
                      : lossClassName
                  }
                >
                  <img
                    className="size-8"
                    src={game.homeTeam.logo}
                    alt={`${game.homeTeam.abbrev} logo`}
                  />
                  <p>{(homeWinProbability * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { GamePredictions }
