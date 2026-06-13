import { NHLGame } from '@/types/game'
import { GamePrediction } from '@/types/gamePrediction'
import { GameScheduleResultStatus, GameScheduleRow } from '@/types/gameSchedule'
import { GameStatus, isLive } from '@/utils/game'

function getResultStatus(
  predictedWinner: string,
  actualWinner: string | null,
  gameState: GameStatus
): GameScheduleResultStatus {
  if (gameState === 'FUT') return 'pending'
  if (actualWinner === null) return 'tied'
  return actualWinner === predictedWinner ? 'correct' : 'incorrect'
}

export function toScheduleRowFromPrediction(
  prediction: GamePrediction,
  game: NHLGame,
  live?: { homeScore: number; awayScore: number; status: GameStatus }
): GameScheduleRow {
  const { predictedWinner } = prediction
  const confidence =
    predictedWinner === prediction.homeTeam
      ? prediction.homeTeamWinProbability
      : prediction.awayTeamWinProbability

  const status = live?.status ?? game.gameState

  let actualWinner: string | null = null
  if (live && status !== 'FUT') {
    actualWinner =
      live.homeScore > live.awayScore
        ? prediction.homeTeam
        : live.awayScore > live.homeScore
          ? prediction.awayTeam
          : null
  }

  return {
    id: prediction.gameId,
    awayTeam: prediction.awayTeam,
    homeTeam: prediction.homeTeam,
    awayScore: live && status !== 'FUT' ? live.awayScore : null,
    homeScore: live && status !== 'FUT' ? live.homeScore : null,
    predictedWinner,
    confidence,
    startTimeUTC: game.startTimeUTC,
    gameState: status,
    resultStatus: getResultStatus(predictedWinner, actualWinner, status),
  }
}

export function toScheduleRowFromCompletedGame(
  game: GamePrediction
): GameScheduleRow {
  const { predictedWinner } = game
  const confidence =
    predictedWinner === game.homeTeam
      ? game.homeTeamWinProbability
      : game.awayTeamWinProbability

  return {
    id: game.gameId,
    awayTeam: game.awayTeam,
    homeTeam: game.homeTeam,
    awayScore: game.outcome?.awayScore ?? null,
    homeScore: game.outcome?.homeScore ?? null,
    predictedWinner,
    confidence,
    gameState: 'FINAL',
    resultStatus: game.outcome
      ? game.outcome.correctPrediction
        ? 'correct'
        : 'incorrect'
      : 'pending',
  }
}

export function isRowLive(row: GameScheduleRow): boolean {
  return row.gameState !== undefined && isLive(row.gameState)
}

export function getRowBorderClass(row: GameScheduleRow): string {
  if (row.resultStatus === 'tied') return 'border-l-4 border-l-yellow-500'
  if (row.resultStatus === 'correct') return 'border-l-4 border-l-green-500'
  if (row.resultStatus === 'incorrect') return 'border-l-4 border-l-red-500'
  return 'border-l-4 border-l-transparent'
}

export function getConfidenceClass(confidence: number): string {
  if (confidence >= 0.7) return 'text-green-400'
  if (confidence >= 0.6) return 'text-blue-400'
  return 'text-yellow-400'
}
