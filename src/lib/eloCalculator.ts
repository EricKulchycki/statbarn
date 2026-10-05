import { getMatchupHistoryForTeam } from '@/data/teams'
import { NHLGame } from '@/types/game'
import { mapNhlGameType } from '@/utils/gameType'
import type {
  ELOCalculationResult,
  ELOsByTeam,
} from '@statbarn/prediction-core'
import {
  ELO_CONFIG,
  adjustKFactor,
  calculateELOUpdate,
} from '@statbarn/prediction-core'

export type { ELOCalculationResult, ELOsByTeam }

const MAX_MATCHUP_ADJUSTMENT = 8

export async function calculateGameELO(
  game: NHLGame,
  currentElos: ELOsByTeam,
  kFactor: number = ELO_CONFIG.kFactor
): Promise<ELOCalculationResult> {
  const homeAbbrev = game.homeTeam.abbrev
  const awayAbbrev = game.awayTeam.abbrev

  const homeElo = currentElos[homeAbbrev] ?? ELO_CONFIG.initialRating
  const awayElo = currentElos[awayAbbrev] ?? ELO_CONFIG.initialRating

  const matchupFactor = await getLast5MatchupFactor(game)

  const isInFuture = new Date(game.startTimeUTC) > new Date()
  const goalDiff = Math.abs(game.homeTeam.score - game.awayTeam.score)
  const effectiveK = isInFuture ? kFactor : adjustKFactor(kFactor, goalDiff)

  return calculateELOUpdate(
    homeAbbrev,
    awayAbbrev,
    homeElo,
    awayElo,
    game.homeTeam.score,
    game.awayTeam.score,
    matchupFactor,
    effectiveK
  )
}

export async function getLast5MatchupFactor(
  game: NHLGame
): Promise<{ homeFactor: number; awayFactor: number }> {
  const homeAbbrev = game.homeTeam.abbrev
  const awayAbbrev = game.awayTeam.abbrev

  const last5Games = await getMatchupHistoryForTeam(
    homeAbbrev,
    awayAbbrev,
    5,
    game.season
  )

  if (last5Games.length === 0) return { homeFactor: 0, awayFactor: 0 }

  const homeWins = last5Games.filter((g) => g.outcome?.actualWin).length
  const totalGames = last5Games.length
  const homeWinRate = homeWins / totalGames

  const matchupAdvantage =
    Math.abs(homeWinRate - 0.5) * 2 * MAX_MATCHUP_ADJUSTMENT

  if (homeWinRate > 0.5) return { homeFactor: matchupAdvantage, awayFactor: 0 }
  if (homeWinRate < 0.5) return { homeFactor: 0, awayFactor: matchupAdvantage }
  return { homeFactor: 0, awayFactor: 0 }
}

export { mapNhlGameType }
