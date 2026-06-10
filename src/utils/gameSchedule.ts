import { GameELO } from '@/models/gameElo'
import { Prediction } from '@/models/prediction'
import { NHLGame } from '@/types/game'
import { GameScheduleResultStatus, GameScheduleRow } from '@/types/gameSchedule'
import { GameStatus, isLive } from '@/utils/game'
import {
  getActualWinnerFromGameELO,
  getPredictedWinnerFromGameELO,
} from '@/utils/gameElo'
import { getPredictedWinnerFromPrediction } from '@/utils/prediction'

function getConfidenceForPrediction(
  prediction: Prediction,
  predictedWinner: string
): number {
  return predictedWinner === prediction.homeTeam
    ? prediction.homeTeamWinProbability
    : prediction.awayTeamWinProbability
}

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
  prediction: Prediction,
  game: NHLGame,
  live?: { homeScore: number; awayScore: number; status: GameStatus }
): GameScheduleRow {
  const predictedWinner = getPredictedWinnerFromPrediction(prediction)
  const confidence = getConfidenceForPrediction(prediction, predictedWinner)
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

export function toScheduleRowFromGameElo(gameElo: GameELO): GameScheduleRow {
  const predictedWinner = getPredictedWinnerFromGameELO(gameElo)
  const actualWinner = getActualWinnerFromGameELO(gameElo)
  const homeConf = gameElo.expectedResult?.homeTeam ?? 0.5
  const awayConf = gameElo.expectedResult?.awayTeam ?? 0.5
  const confidence =
    predictedWinner === gameElo.homeTeam.abbrev ? homeConf : awayConf

  return {
    id: gameElo.gameId,
    awayTeam: gameElo.awayTeam.abbrev,
    homeTeam: gameElo.homeTeam.abbrev,
    awayScore: gameElo.awayTeam.score,
    homeScore: gameElo.homeTeam.score,
    predictedWinner,
    confidence,
    gameState: 'FINAL',
    resultStatus: actualWinner === predictedWinner ? 'correct' : 'incorrect',
  }
}

export function isRowLive(row: GameScheduleRow): boolean {
  return row.gameState !== undefined && isLive(row.gameState)
}

export function getRowBorderClass(row: GameScheduleRow): string {
  if (row.resultStatus === 'tied') {
    return 'border-l-4 border-l-yellow-500'
  }
  if (row.resultStatus === 'correct') {
    return 'border-l-4 border-l-green-500'
  }
  if (row.resultStatus === 'incorrect') {
    return 'border-l-4 border-l-red-500'
  }
  return 'border-l-4 border-l-transparent'
}

export function getConfidenceClass(confidence: number): string {
  if (confidence >= 0.7) return 'text-green-400'
  if (confidence >= 0.6) return 'text-blue-400'
  return 'text-yellow-400'
}
