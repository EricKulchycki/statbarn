export { ELO_CONFIG, MODEL_VERSION } from './constants'
export {
  adjustKFactor,
  calculateELOUpdate,
  regressToMean,
} from './eloCalculator'
export { predictGame } from './predictor'
export type {
  ELOCalculationResult,
  ELOsByTeam,
  MatchupFactor,
  PredictionInput,
  PredictionOutput,
  TeamELOResult,
} from './types'
