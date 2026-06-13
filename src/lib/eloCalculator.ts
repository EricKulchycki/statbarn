import { ELO_CONFIG } from '@/constants'
import { getMatchupHistoryForTeam } from '@/data/teams'
import { predictorService } from '@/services/predictor.service'
import { NHLGame } from '@/types/game'
import { mapNhlGameType } from '@/utils/gameType'

export interface ELOCalculationResult {
  homeTeam: { eloBefore: number; eloAfter: number; eloChange: number }
  awayTeam: { eloBefore: number; eloAfter: number; eloChange: number }
  newElos: { [abbrev: string]: number }
}

export interface ELOsByTeam {
  [abbrev: string]: number
}

const K_FACTOR = ELO_CONFIG.kFactor
const INITIAL_ELO = ELO_CONFIG.initialRating
const MAX_MATCHUP_ADJUSTMENT = 8

export async function calculateGameELO(
  game: NHLGame,
  currentElos: ELOsByTeam,
  kFactor: number = K_FACTOR
): Promise<ELOCalculationResult> {
  const homeAbbrev = game.homeTeam.abbrev
  const awayAbbrev = game.awayTeam.abbrev

  const homeEloBefore = currentElos[homeAbbrev] || INITIAL_ELO
  const awayEloBefore = currentElos[awayAbbrev] || INITIAL_ELO

  const matchupFactor = await getLast5MatchupFactor(game)

  const { homeWinProbability: homeExpected, awayWinProbability: awayExpected } =
    predictorService.predictGame({
      homeAbbrev,
      awayAbbrev,
      homeElo: homeEloBefore,
      awayElo: awayEloBefore,
      matchupFactor,
    })

  const homeActualResult =
    game.homeTeam.score > game.awayTeam.score
      ? 1
      : game.homeTeam.score === game.awayTeam.score
        ? 0.5
        : 0
  const awayActualResult = 1 - homeActualResult

  const isInFuture = new Date(game.startTimeUTC) > new Date()
  const goalDiff = Math.abs(game.homeTeam.score - game.awayTeam.score)
  const adjustedK = isInFuture ? kFactor : adjustKFactor(kFactor, goalDiff)

  const homeEloChange = adjustedK * (homeActualResult - homeExpected)
  const awayEloChange = adjustedK * (awayActualResult - awayExpected)

  const newElos = { ...currentElos }
  newElos[homeAbbrev] = homeEloBefore + homeEloChange
  newElos[awayAbbrev] = awayEloBefore + awayEloChange

  return {
    homeTeam: {
      eloBefore: homeEloBefore,
      eloAfter: homeEloBefore + homeEloChange,
      eloChange: homeEloChange,
    },
    awayTeam: {
      eloBefore: awayEloBefore,
      eloAfter: awayEloBefore + awayEloChange,
      eloChange: awayEloChange,
    },
    newElos,
  }
}

function adjustKFactor(baseK: number, goalDiff: number): number {
  if (goalDiff === 0) return baseK
  const cappedDiff = Math.min(goalDiff, 4)
  const adjustedK = baseK * (1 + Math.log(1 + cappedDiff) * 0.3)
  return Math.min(adjustedK, 100)
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

// Keep mapNhlGameType re-export for any legacy callers
export { mapNhlGameType }
