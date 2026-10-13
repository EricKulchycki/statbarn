// Stamped on every new prediction; bump when the model changes and record the
// change in docs/MODEL_CHANGELOG.md
export const MODEL_VERSION = 'v2'

export const ELO_CONFIG = {
  // Hockey results are noisy; walk-forward backtests over 2023-26 put the
  // best-calibrated K between 4 and 12 (32 was overconfident)
  kFactor: 8,
  initialRating: 1500,
  homeAdvantage: 25,
  meanRegressionFactor: 0.33,
} as const
