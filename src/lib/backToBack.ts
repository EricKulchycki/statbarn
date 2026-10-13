import { TeamSeasonGame } from '@/types/team'
import { DateTime } from 'luxon'

export interface BackToBackSummary {
  games: number
  wins: number
  expectedWins: number
  // Wins above expectation per back-to-back game; negative means fatigue hurts
  residual: number
}

type ScheduledGame = Pick<TeamSeasonGame, 'scheduleDate'>

function isNextDay(earlier: string, later: string): boolean {
  return (
    DateTime.fromISO(earlier, { zone: 'utc' }).plus({ days: 1 }).toISODate() ===
    later
  )
}

// Flags the second night of each back-to-back for one team. Uses scheduleDate
// (the NHL schedule day) so late UTC start times don't shift a game's day.
export function markBackToBacks<T extends ScheduledGame>(
  games: T[]
): Array<T & { isBackToBack: boolean }> {
  const sorted = games
    .filter((g) => Boolean(g.scheduleDate))
    .sort((a, b) => a.scheduleDate.localeCompare(b.scheduleDate))

  return sorted.map((game, i) => ({
    ...game,
    isBackToBack:
      i > 0 && isNextDay(sorted[i - 1].scheduleDate, game.scheduleDate),
  }))
}

// Measures one team's back-to-back results against the model's expectation.
// Expectation uses the pre-factor probability when present, so a back-to-back
// factor is never measured against itself.
export function summarizeBackToBacks(
  games: TeamSeasonGame[]
): BackToBackSummary {
  const scored = markBackToBacks(games).filter(
    (g) => g.isBackToBack && g.outcome && g.prediction
  )

  const wins = scored.filter((g) => g.outcome!.actualWin).length
  const expectedWins = scored.reduce(
    (sum, g) =>
      sum + (g.prediction!.baseWinProbability ?? g.prediction!.winProbability),
    0
  )

  return {
    games: scored.length,
    wins,
    expectedWins,
    residual: scored.length > 0 ? (wins - expectedWins) / scored.length : 0,
  }
}

// Largest Elo swing a back-to-back history can apply to one team
export const MAX_B2B_ADJUSTMENT = 50

// Elo points that move a 50% win probability by `residual`, capped. Residuals
// beyond ±0.5 have no Elo equivalent, so they are clamped before converting.
export function backToBackEloAdjustment(
  residual: number,
  cap: number = MAX_B2B_ADJUSTMENT
): number {
  const r = Math.max(-0.499, Math.min(0.499, residual))
  const elo = 400 * Math.log10((0.5 + r) / (0.5 - r))
  return Math.max(-cap, Math.min(cap, elo))
}
