import { ELO_CONFIG } from './constants'
import type { PredictionInput, PredictionOutput } from './types'

export function predictGame(input: PredictionInput): PredictionOutput {
  const {
    homeAbbrev,
    awayAbbrev,
    homeElo,
    awayElo,
    matchupFactor = { homeFactor: 0, awayFactor: 0 },
  } = input

  const homeAdj = homeElo + ELO_CONFIG.homeAdvantage + matchupFactor.homeFactor
  const awayAdj = awayElo + matchupFactor.awayFactor
  const ratingDiff = awayAdj - homeAdj
  const homeWinProbability = 1 / (1 + Math.pow(10, ratingDiff / 400))
  const awayWinProbability = 1 - homeWinProbability

  return {
    homeWinProbability,
    awayWinProbability,
    predictedWinner: homeWinProbability >= 0.5 ? homeAbbrev : awayAbbrev,
  }
}
