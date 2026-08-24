export { ELO_CONFIG } from './constants'
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
