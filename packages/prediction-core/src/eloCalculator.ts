import { DEFAULT_MODEL_PARAMS } from './constants'
import { predictGame } from './predictor'
import type {
  ELOCalculationResult,
  MarginOfVictoryParams,
  MatchupFactor,
  ModelParams,
} from './types'

export function calculateELOUpdate(
  homeAbbrev: string,
  awayAbbrev: string,
  homeElo: number,
  awayElo: number,
  homeScore: number,
  awayScore: number,
  matchupFactor: MatchupFactor = { homeFactor: 0, awayFactor: 0 },
  kFactor: number = DEFAULT_MODEL_PARAMS.kFactor,
  params: Pick<ModelParams, 'homeAdvantage'> = DEFAULT_MODEL_PARAMS
): ELOCalculationResult {
  const { homeWinProbability: homeExpected, awayWinProbability: awayExpected } =
    predictGame(
      { homeAbbrev, awayAbbrev, homeElo, awayElo, matchupFactor },
      params
    )

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

export function adjustKFactor(
  baseK: number,
  goalDiff: number,
  mov: MarginOfVictoryParams = DEFAULT_MODEL_PARAMS.marginOfVictory
): number {
  if (!mov.enabled || goalDiff === 0) return baseK
  const cappedDiff = Math.min(goalDiff, mov.goalDiffCap)
  const adjustedK = baseK * (1 + Math.log(1 + cappedDiff) * mov.scale)
  return Math.min(adjustedK, mov.maxK)
}

export function regressToMean(
  elo: number,
  params: Pick<
    ModelParams,
    'initialRating' | 'meanRegressionFactor'
  > = DEFAULT_MODEL_PARAMS
): number {
  return elo + (params.initialRating - elo) * params.meanRegressionFactor
}

// Elo bonus for whichever side has won more of their recent meetings,
// scaled from 0 (even record) to maxAdjustment (clean sweep)
export function matchupFactorFromRecord(
  homeWins: number,
  meetings: number,
  maxAdjustment: number = DEFAULT_MODEL_PARAMS.matchupMaxAdjustment
): MatchupFactor {
  if (meetings === 0) return { homeFactor: 0, awayFactor: 0 }
  const homeWinRate = homeWins / meetings
  const advantage = Math.abs(homeWinRate - 0.5) * 2 * maxAdjustment
  if (homeWinRate > 0.5) return { homeFactor: advantage, awayFactor: 0 }
  if (homeWinRate < 0.5) return { homeFactor: 0, awayFactor: advantage }
  return { homeFactor: 0, awayFactor: 0 }
}
