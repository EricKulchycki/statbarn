import { eloService } from '@/services/elo.service'
import { formatDate } from '@/utils/time'
import { DateTime } from 'luxon'
import React from 'react'

export async function YesterdaysGameOutcomes() {
  // Get yesterday's date string (YYYY-MM-DD)
  const yesterday = DateTime.now().minus({ days: 1 }).startOf('day')

  // Fetch all gameElos for yesterday
  const gameElos = await eloService.getLastEloGamesForDate(yesterday.toJSDate())

  if (!gameElos || gameElos.length === 0) {
    return (
      <div className="my-4">
        <h2 className="text-lg font-bold">Yesterday&apos;s Game Outcomes</h2>
        <p className="text-sm text-gray-400">No games were played yesterday.</p>
      </div>
    )
  }

  return (
    <div className="my-4">
      <h2 className="text-lg font-bold">Yesterday&apos;s Game Outcomes</h2>
      <div className="flex flex-wrap gap-4 w-full my-4">
        {gameElos.map((game) => (
          <div
            key={game.gameId}
            className="w-full border rounded-lg p-4 bg-slate-900"
          >
            <h3 className="text-md font-semibold mb-2">
              <time dateTime={game.gameDate.toISOString()}>
                {formatDate(game.gameDate)}
              </time>
            </h3>
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg">
                  {game.homeTeam.abbrev}
                </span>
                <span className="text-xl">{game.homeTeam.score}</span>
                <span className="text-xs text-gray-400">Home</span>
              </div>
              <span className="mx-4 font-bold text-xl">vs</span>
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg">
                  {game.awayTeam.abbrev}
                </span>
                <span className="text-xl">{game.awayTeam.score}</span>
                <span className="text-xs text-gray-400">Away</span>
              </div>
            </div>
            <div className="mt-2 text-sm">
              Winner:{' '}
              <span className="font-bold">
                {game.homeTeam.score > game.awayTeam.score
                  ? game.homeTeam.abbrev
                  : game.awayTeam.abbrev}
              </span>
            </div>
            {typeof game.expectedResult?.homeTeam === 'number' && (
              <div className="mt-1 text-sm">
                Prediction:{' '}
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
                    game.expectedResult.awayTeam > game.expectedResult.homeTeam)
                    ? 'Correct'
                    : 'Incorrect'}
                </span>
                <span className="ml-2 text-gray-400">
                  (Predicted:{' '}
                  {game.expectedResult.homeTeam > game.expectedResult.awayTeam
                    ? game.homeTeam.abbrev
                    : game.awayTeam.abbrev}
                  )
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
