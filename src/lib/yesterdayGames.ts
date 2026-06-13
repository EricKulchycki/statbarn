import { getTimezoneFromCookie } from '@/lib/time'
import { eloService } from '@/services/elo.service'
import { GamePrediction } from '@/types/gamePrediction'
import { DateTime } from 'luxon'

export interface YesterdayGamesSummary {
  games: GamePrediction[]
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

  let games: GamePrediction[] = []
  try {
    games = await eloService.getLastEloGamesForDate(yesterday.toJSDate())
  } catch (error) {
    console.error('Error fetching yesterday games:', error)
  }

  const correctPredictions = games.filter(
    (g) => g.outcome?.correctPrediction
  ).length
  const totalGames = games.length
  const accuracy =
    totalGames > 0
      ? ((correctPredictions / totalGames) * 100).toFixed(1)
      : 'N/A'

  return {
    games,
    correctPredictions,
    totalGames,
    accuracy,
    dateLabel: yesterday.toFormat('MMM d'),
  }
}
