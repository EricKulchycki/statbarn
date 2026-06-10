import { GameStatus } from '@/utils/game'

export type GameScheduleResultStatus =
  | 'correct'
  | 'incorrect'
  | 'tied'
  | 'pending'

export interface GameScheduleRow {
  id: number
  awayTeam: string
  homeTeam: string
  awayScore: number | null
  homeScore: number | null
  predictedWinner: string
  confidence: number
  startTimeUTC?: string
  gameState?: GameStatus
  resultStatus: GameScheduleResultStatus
}
