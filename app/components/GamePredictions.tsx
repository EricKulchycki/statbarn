import { SeasonELO } from '~/types/elo'
import { NHLGameDay } from '~/types/game'

const calculateWinProbability = (homeELO: number, awayELO: number): number => {
  const eloDifference = homeELO - awayELO
  return 1 / (1 + Math.pow(10, -eloDifference / 400))
}

interface GamePredictionsProps {
  dayLabel: string
  todaysGames: NHLGameDay
  elos: SeasonELO[]
}

function GamePredictions({
  dayLabel,
  todaysGames,
  elos,
}: GamePredictionsProps) {
  if (!todaysGames.games.length) {
    return <p>No games scheduled for today.</p>
  }

  return (
    <div className="p-4 m-8 max-h-fit max-w-80">
      <h2 className="text-lg font-semibold mb-4">
        Game Predictions for {dayLabel}
      </h2>
      <div className="flex flex-col gap-3">
        {todaysGames.games.map((game) => {
          const homeTeamELO =
            elos.find((team) => team.abbrev === game.homeTeam.abbrev)?.elo || 0
          const awayTeamELO =
            elos.find((team) => team.abbrev === game.awayTeam.abbrev)?.elo || 0

          const homeWinProbability = calculateWinProbability(
            homeTeamELO,
            awayTeamELO
          )

          const awayWinProbability = 1 - homeWinProbability

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
                <p>@</p>
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
