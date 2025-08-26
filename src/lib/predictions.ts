import { NHLGame } from '@/types/game'
import { calculateWinProbability } from './elo'
import { LatestELO } from '@/data/gameElo'

export function calculateGamePrediction(elos: LatestELO[], game: NHLGame) {
  const homeTeamELO =
    elos.find((team) => team.abbrev === game.homeTeam.abbrev)?.elo || 0
  const awayTeamELO =
    elos.find((team) => team.abbrev === game.awayTeam.abbrev)?.elo || 0

  const homeWinProbability = calculateWinProbability(homeTeamELO, awayTeamELO)

  const awayWinProbability = 1 - homeWinProbability
  return { homeWinProbability, awayWinProbability }
}
