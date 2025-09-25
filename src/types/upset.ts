import { DateTime } from 'luxon'

export interface Upset {
  gameId: number
  date: DateTime
  homeTeam: string
  awayTeam: string
  predictedWinner: string
  actualWinner: string
  homeScore: number
  awayScore: number
}
