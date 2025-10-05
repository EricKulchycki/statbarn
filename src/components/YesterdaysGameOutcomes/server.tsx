import { getTimezoneFromCookie } from '@/lib/time'
import { eloService } from '@/services/elo.service'
import {
  getActualWinnerFromGameELO,
  getPredictedWinnerFromGameELO,
} from '@/utils/gameElo'
import { DateTime } from 'luxon'
import React from 'react'
import { YesterdaysGameOutcomes as YesterdaysGamesOutcomesClient } from './client'
import { GameELO } from '@/models/gameElo'

export async function YesterdaysGameOutcomes() {
  const localTimezone = await getTimezoneFromCookie()
  const localDate = DateTime.now().setZone(localTimezone).toISODate()
  const yesterday =
    localDate !== ''
      ? DateTime.fromISO(localDate || '').minus({ days: 1 })
      : DateTime.now().minus({ days: 1 })

  // Fetch all gameElos for yesterday
  let gameElos: GameELO[] = []
  try {
    gameElos = await eloService.getLastEloGamesForDate(yesterday.toJSDate())
  } catch (error) {
    console.error('Error fetching yesterday ELO games:', error)
  }

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
      const predictedWinner = getPredictedWinnerFromGameELO(game)
      const actualWinner = getActualWinnerFromGameELO(game)
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
      <YesterdaysGamesOutcomesClient gameElos={gameElos} />
    </div>
  )
}
