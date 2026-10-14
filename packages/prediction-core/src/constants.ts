import type { ModelParams } from './types'

// Fallback model when no active version is stored in the database. Versions
// themselves live in the modelVersions collection; see docs/MODEL_CHANGELOG.md
export const MODEL_VERSION = 'v2'

export const DEFAULT_MODEL_PARAMS: ModelParams = {
  // Hockey results are noisy; walk-forward backtests over 2023-26 put the
  // best-calibrated K between 4 and 12 (32 was overconfident)
  kFactor: 8,
  initialRating: 1500,
  homeAdvantage: 25,
  meanRegressionFactor: 0.33,
  marginOfVictory: { enabled: true, goalDiffCap: 4, scale: 0.3, maxK: 100 },
  matchupMaxAdjustment: 8,
}

export const ELO_CONFIG = {
  kFactor: DEFAULT_MODEL_PARAMS.kFactor,
  initialRating: DEFAULT_MODEL_PARAMS.initialRating,
  homeAdvantage: DEFAULT_MODEL_PARAMS.homeAdvantage,
  meanRegressionFactor: DEFAULT_MODEL_PARAMS.meanRegressionFactor,
} as const
