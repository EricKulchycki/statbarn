export { DEFAULT_MODEL_PARAMS, ELO_CONFIG, MODEL_VERSION } from './constants'
export {
  adjustKFactor,
  calculateELOUpdate,
  matchupFactorFromRecord,
  regressToMean,
} from './eloCalculator'
export { predictGame } from './predictor'
export type {
  ELOCalculationResult,
  ELOsByTeam,
  MarginOfVictoryParams,
  MatchupFactor,
  ModelParams,
  PredictionInput,
  PredictionOutput,
  TeamELOResult,
} from './types'
