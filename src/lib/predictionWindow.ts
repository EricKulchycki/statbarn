import { NHLGame, NHLGameDay } from '@/types/game'
import { isFinal, isLive } from '@/utils/game'

// Today plus the next two days, matching the day navigation
export const PREDICTION_WINDOW_DAYS = 3

const REGULAR_SEASON = 2

export interface PredictionDay {
  date: string
  games: NHLGame[]
}

// Regular-season games in the window that haven't started. Started games are
// left alone so a prediction never changes after puck drop.
export function selectGamesToPredict(
  gameWeek: NHLGameDay[],
  fromDate: string,
  days: number = PREDICTION_WINDOW_DAYS
): PredictionDay[] {
  return [...gameWeek]
    .filter((day) => day.date >= fromDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, days)
    .map((day) => ({
      date: day.date,
      games: day.games.filter(
        (g) =>
          g.gameType === REGULAR_SEASON &&
          !isLive(g.gameState) &&
          !isFinal(g.gameState)
      ),
    }))
    .filter((day) => day.games.length > 0)
}
