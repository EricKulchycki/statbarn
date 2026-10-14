import { getMatchupHistoryForTeam } from '@/data/teams'
import { NHLGame } from '@/types/game'
import { mapNhlGameType } from '@/utils/gameType'
import type {
  ELOCalculationResult,
  ELOsByTeam,
  MatchupFactor,
  ModelParams,
} from '@statbarn/prediction-core'
import {
  DEFAULT_MODEL_PARAMS,
  adjustKFactor,
  calculateELOUpdate,
  matchupFactorFromRecord,
} from '@statbarn/prediction-core'

export type { ELOCalculationResult, ELOsByTeam }

export async function calculateGameELO(
  game: NHLGame,
  currentElos: ELOsByTeam,
  params: ModelParams = DEFAULT_MODEL_PARAMS
): Promise<ELOCalculationResult> {
  const homeAbbrev = game.homeTeam.abbrev
  const awayAbbrev = game.awayTeam.abbrev

  const homeElo = currentElos[homeAbbrev] ?? params.initialRating
  const awayElo = currentElos[awayAbbrev] ?? params.initialRating

  const matchupFactor = await getLast5MatchupFactor(
    game,
    params.matchupMaxAdjustment
  )

  const isInFuture = new Date(game.startTimeUTC) > new Date()
  const goalDiff = Math.abs(game.homeTeam.score - game.awayTeam.score)
  const effectiveK = isInFuture
    ? params.kFactor
    : adjustKFactor(params.kFactor, goalDiff, params.marginOfVictory)

  return calculateELOUpdate(
    homeAbbrev,
    awayAbbrev,
    homeElo,
    awayElo,
    game.homeTeam.score,
    game.awayTeam.score,
    matchupFactor,
    effectiveK,
    params
  )
}

export async function getLast5MatchupFactor(
  game: NHLGame,
  maxAdjustment: number = DEFAULT_MODEL_PARAMS.matchupMaxAdjustment
): Promise<MatchupFactor> {
  const homeAbbrev = game.homeTeam.abbrev
  const awayAbbrev = game.awayTeam.abbrev

  const last5Games = await getMatchupHistoryForTeam(
    homeAbbrev,
    awayAbbrev,
    5,
    game.season
  )

  const homeWins = last5Games.filter((g) => g.outcome?.actualWin).length
  return matchupFactorFromRecord(homeWins, last5Games.length, maxAdjustment)
}

export { mapNhlGameType }
