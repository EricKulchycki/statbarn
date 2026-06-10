import { eloService } from '@/services/elo.service'
import { getTimezoneFromCookie } from '@/lib/time'
import {
  getActualWinnerFromGameELO,
  getPredictedWinnerFromGameELO,
} from '@/utils/gameElo'
import { GameELO } from '@/models/gameElo'
import { DateTime } from 'luxon'

export interface YesterdayGamesSummary {
  gameElos: GameELO[]
  correctPredictions: number
  totalGames: number
  accuracy: string
  dateLabel: string
}

export async function getYesterdayGamesSummary(): Promise<YesterdayGamesSummary> {
  const localTimezone = await getTimezoneFromCookie()
  const localDate = DateTime.now().setZone(localTimezone).toISODate()
  const yesterday =
    localDate != null && localDate !== ''
      ? DateTime.fromISO(localDate).minus({ days: 1 })
      : DateTime.now().minus({ days: 1 })

  let gameElos: GameELO[] = []
  try {
    gameElos = await eloService.getLastEloGamesForDate(yesterday.toJSDate())
  } catch (error) {
    console.error('Error fetching yesterday ELO games:', error)
  }

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

  const totalGames = gameElos.length
  const accuracy =
    totalGames > 0
      ? ((correctPredictions / totalGames) * 100).toFixed(1)
      : 'N/A'

  return {
    gameElos,
    correctPredictions,
    totalGames,
    accuracy,
    dateLabel: yesterday.toFormat('MMM d'),
  }
}
