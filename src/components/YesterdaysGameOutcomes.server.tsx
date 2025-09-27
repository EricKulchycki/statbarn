import { getTimezoneFromCookie } from '@/lib/time'
import { eloService } from '@/services/elo.service'
import { DateTime } from 'luxon'
import React from 'react'

export async function YesterdaysGameOutcomes() {
  const localTimezone = await getTimezoneFromCookie()
  const localDate = DateTime.now().setZone(localTimezone).toISODate()
  const yesterday =
    localDate !== ''
      ? DateTime.fromISO(localDate || '').minus({ days: 1 })
      : DateTime.now().minus({ days: 1 })

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

  // Calculate prediction accuracy
  const totalGames = gameElos.length
  let correctPredictions = 0
  gameElos.forEach((game) => {
    if (typeof game.expectedResult?.homeTeam === 'number') {
      const predictedWinner =
        game.expectedResult.homeTeam > game.expectedResult.awayTeam
          ? game.homeTeam.abbrev
          : game.awayTeam.abbrev
      const actualWinner =
        game.homeTeam.score > game.awayTeam.score
          ? game.homeTeam.abbrev
          : game.awayTeam.abbrev
      if (predictedWinner === actualWinner) {
        correctPredictions++
      }
    }
  })
  const accuracy =
    totalGames > 0
      ? ((correctPredictions / totalGames) * 100).toFixed(1)
      : 'N/A'

  return (
    <div className="my-4">
      <h2 className="text-lg font-bold">Yesterday&apos;s Game Outcomes</h2>
      <div className="mb-4 text-md text-blue-400 font-semibold">
        Prediction Accuracy: {accuracy}% ({correctPredictions} of {totalGames}{' '}
        games)
      </div>
      <div className="flex flex-wrap gap-4 w-full my-4">
        {gameElos.map((game) => (
          <div key={game.gameId} className="w-fit flex-1 p-2">
            <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-md p-4 flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs text-gray-400">
                  {DateTime.fromJSDate(game.gameDate)
                    .setZone(game.gameTimezone || localTimezone)
                    .toLocaleString(DateTime.DATETIME_MED)}
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
    </div>
  )
}
