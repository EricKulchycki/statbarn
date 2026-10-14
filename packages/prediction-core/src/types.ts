export interface MarginOfVictoryParams {
  enabled: boolean
  // Goal differences above this count as this many
  goalDiffCap: number
  // K grows by scale·ln(1 + goalDiff)
  scale: number
  maxK: number
}

// Every tunable number in the model; stored per version in the database
export interface ModelParams {
  kFactor: number
  initialRating: number
  homeAdvantage: number
  // Share of the gap to initialRating closed between seasons
  meanRegressionFactor: number
  marginOfVictory: MarginOfVictoryParams
  // Largest Elo swing from the last-5 head-to-head record
  matchupMaxAdjustment: number
}

export interface MatchupFactor {
  homeFactor: number
  awayFactor: number
}

export interface PredictionInput {
  homeAbbrev: string
  awayAbbrev: string
  homeElo: number
  awayElo: number
  matchupFactor?: MatchupFactor
}

export interface PredictionOutput {
  homeWinProbability: number
  awayWinProbability: number
  predictedWinner: string
}

export interface TeamELOResult {
  eloBefore: number
  eloAfter: number
  eloChange: number
}

export interface ELOCalculationResult {
  homeTeam: TeamELOResult
  awayTeam: TeamELOResult
}

export type ELOsByTeam = Record<string, number>
