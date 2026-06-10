import { GameStatus } from '@/utils/game'

export type LiveGame = {
  [gameId: number]: { homeScore: number; awayScore: number; status: GameStatus }
}
