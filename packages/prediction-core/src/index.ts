export { ELO_CONFIG } from './constants'
export type {
  MatchupFactor,
  PredictionInput,
  PredictionOutput,
  TeamELOResult,
  ELOCalculationResult,
  ELOsByTeam,
} from './types'
export { predictGame } from './predictor'
export { calculateELOUpdate, adjustKFactor, regressToMean } from './eloCalculator'
