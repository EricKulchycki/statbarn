import type { ModelParams } from '@statbarn/prediction-core'

export type ModelStatus = 'draft' | 'active' | 'retired'

export interface SeasonBacktest {
  season: number
  games: number
  brier: number
}

export interface ModelBacktest {
  ranAt: Date
  // Seasons the params may have been tuned against
  trainSeasons: number[]
  trainBrier: number | null
  // Most recent completed season, kept out of tuning
  holdoutSeason: number | null
  holdoutBrier: number | null
  seasons: SeasonBacktest[]
}

export interface ModelVersion {
  version: string
  status: ModelStatus
  // Never edited once a version leaves draft; changes become a new version
  params: ModelParams
  notes: string
  basedOn?: string
  activatedAt?: Date
  retiredAt?: Date
  backtest?: ModelBacktest
  createdAt: Date
  updatedAt: Date
}

// What prediction and outcome code needs from a version
export type ModelSnapshot = Pick<ModelVersion, 'version' | 'params'>
