import { ELO_CONFIG } from './constants'
import { predictGame } from './predictor'
import type { ELOCalculationResult, MatchupFactor } from './types'

export function calculateELOUpdate(
  homeAbbrev: string,
  awayAbbrev: string,
  homeElo: number,
  awayElo: number,
  homeScore: number,
  awayScore: number,
  matchupFactor: MatchupFactor = { homeFactor: 0, awayFactor: 0 },
  kFactor: number = ELO_CONFIG.kFactor
): ELOCalculationResult {
  const { homeWinProbability: homeExpected, awayWinProbability: awayExpected } =
    predictGame({ homeAbbrev, awayAbbrev, homeElo, awayElo, matchupFactor })

  const homeActualResult =
    homeScore > awayScore ? 1 : homeScore === awayScore ? 0.5 : 0
  const awayActualResult = 1 - homeActualResult

  const homeEloChange = kFactor * (homeActualResult - homeExpected)
  const awayEloChange = kFactor * (awayActualResult - awayExpected)

  return {
    homeTeam: {
      eloBefore: homeElo,
      eloAfter: homeElo + homeEloChange,
      eloChange: homeEloChange,
    },
    awayTeam: {
      eloBefore: awayElo,
      eloAfter: awayElo + awayEloChange,
      eloChange: awayEloChange,
    },
  }
}

export function adjustKFactor(baseK: number, goalDiff: number): number {
  if (goalDiff === 0) return baseK
  const cappedDiff = Math.min(goalDiff, 4)
  const adjustedK = baseK * (1 + Math.log(1 + cappedDiff) * 0.3)
  return Math.min(adjustedK, 100)
}

export function regressToMean(elo: number): number {
  return elo + (ELO_CONFIG.initialRating - elo) * ELO_CONFIG.meanRegressionFactor
}
