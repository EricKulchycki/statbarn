'use client'

import { useIsMobile } from '@/hooks/useIsMobile'
import { GameELO } from '@/models/gameElo'
import {
  getActualWinnerFromGameELO,
  getPredictedWinnerFromGameELO,
} from '@/utils/gameElo'
import { DateTime } from 'luxon'

interface Props {
  gameElos: GameELO[]
}

export function YesterdaysGameOutcomes({ gameElos }: Props) {
  const isMobile = useIsMobile()

  if (isMobile) {
    // Card grid for mobile
    return (
      <div className="flex flex-wrap gap-4 w-full my-4">
        {gameElos.map((game) => (
          <div key={game.gameId} className="w-fit flex-1 p-2">
            <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-md p-4 flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs text-gray-400">
                  {DateTime.fromJSDate(game.gameDate).toLocaleString(
                    DateTime.DATETIME_MED
                  )}
                </span>
              </div>
              <div className="flex items-center gap-4 w-full justify-center">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-lg tracking-wide text-slate-100">
                    {game.homeTeam.abbrev}
                  </span>
                  <span className="text-2xl font-bold text-blue-400">
                    {game.homeTeam.score}
                  </span>
                  <span className="text-xs text-gray-400">Home</span>
                </div>
                <span className="mx-2 text-xl font-bold text-gray-400">vs</span>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-lg tracking-wide text-slate-100">
                    {game.awayTeam.abbrev}
                  </span>
                  <span className="text-2xl font-bold text-red-400">
                    {game.awayTeam.score}
                  </span>
                  <span className="text-xs text-gray-400">Away</span>
                </div>
              </div>
              <div className="mt-2 text-sm flex items-center gap-2">
                <span className="text-gray-400">Winner:</span>
                <span className="font-bold text-green-400">
                  {game.homeTeam.score > game.awayTeam.score
                    ? game.homeTeam.abbrev
                    : game.awayTeam.abbrev}
                </span>
              </div>
              {typeof game.expectedResult?.homeTeam === 'number' && (
                <div>
                  <div className="mt-1 text-xs flex items-center gap-2">
                    <span className="text-gray-400">Prediction:</span>
                    <span
                      className={
                        (game.homeTeam.score > game.awayTeam.score &&
                          game.expectedResult.homeTeam >
                            game.expectedResult.awayTeam) ||
                        (game.awayTeam.score > game.homeTeam.score &&
                          game.expectedResult.awayTeam >
                            game.expectedResult.homeTeam)
                          ? 'text-green-500 font-bold'
                          : 'text-red-500 font-bold'
                      }
                    >
                      {(game.homeTeam.score > game.awayTeam.score &&
                        game.expectedResult.homeTeam >
                          game.expectedResult.awayTeam) ||
                      (game.awayTeam.score > game.homeTeam.score &&
                        game.expectedResult.awayTeam >
                          game.expectedResult.homeTeam)
                        ? 'Correct'
                        : 'Incorrect'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Table for desktop
  return (
    <table className="w-full bg-slate-900 rounded-xl shadow my-4">
      <thead>
        <tr className="text-left text-gray-400">
          <th className="p-3">Date</th>
          <th className="p-3">Home</th>
          <th className="p-3">Away</th>
          <th className="p-3">Score</th>
          <th className="p-3">Prediction</th>
        </tr>
      </thead>
      <tbody>
        {gameElos.map((game) => {
          const winner = getActualWinnerFromGameELO(game)
          const predictedWinner = getPredictedWinnerFromGameELO(game)
          const predictionCorrect = winner === predictedWinner
          return (
            <tr key={game.gameId} className="border-t border-slate-700">
              <td className="p-3">
                {DateTime.fromJSDate(game.gameDate).toLocaleString(
                  DateTime.DATETIME_MED_WITH_WEEKDAY
                )}
              </td>
              <td
                className={`p-3 font-bold ${game.homeTeam.abbrev === winner ? 'text-green-400' : 'text-red-400'}`}
              >
                {game.homeTeam.abbrev}
              </td>
              <td
                className={`p-3 font-bold ${game.awayTeam.abbrev === winner ? 'text-green-400' : 'text-red-400'}`}
              >
                {game.awayTeam.abbrev}
              </td>
              <td className="p-3">
                {game.homeTeam.score} - {game.awayTeam.score}
              </td>
              <td className="p-3">
                <span
                  className={
                    predictionCorrect
                      ? 'text-green-500 font-bold'
                      : 'text-red-500 font-bold'
                  }
                >
                  {predictionCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
