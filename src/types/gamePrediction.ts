export interface GamePrediction {
  gameId: number
  homeTeam: string
  awayTeam: string
  homeTeamWinProbability: number
  awayTeamWinProbability: number
  predictedWinner: string
  gameDate: Date
  modelVersion: string
  outcome?: {
    homeScore: number
    awayScore: number
    winner: string
    correctPrediction: boolean
  }
}

export interface GamePredictionSerialized
  extends Omit<GamePrediction, 'gameDate'> {
  gameDate: string
}

export function serializeGamePrediction(
  p: GamePrediction
): GamePredictionSerialized {
  return {
    ...p,
    gameDate:
      p.gameDate instanceof Date ? p.gameDate.toISOString() : p.gameDate,
  }
}

export function deserializeGamePrediction(
  p: GamePredictionSerialized
): GamePrediction {
  return {
    ...p,
    gameDate:
      typeof p.gameDate === 'string' ? new Date(p.gameDate) : p.gameDate,
  }
}
