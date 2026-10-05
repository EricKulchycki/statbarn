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

export function getYesterdayInZone(timezone: string, now: DateTime): DateTime {
  const local = now.setZone(timezone)
  return (local.isValid ? local : now).minus({ days: 1 })
}

export async function getYesterdayGamesSummary(): Promise<YesterdayGamesSummary> {
  const localTimezone = await getTimezoneFromCookie()
  const yesterday = getYesterdayInZone(localTimezone, DateTime.now())

  let games: GamePrediction[] = []
  try {
    games = await eloService.getLastEloGamesForDate(yesterday.toISODate()!)
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
