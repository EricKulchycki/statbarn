import { SeasonELO } from '~/types/elo'
import { NHLGame } from '~/types/game'
import { calculateWinProbability } from './elo'

export function calculateGamePrediction(elos: SeasonELO[], game: NHLGame) {
  const homeTeamELO =
    elos.find((team) => team.abbrev === game.homeTeam.abbrev)?.elo || 0
  const awayTeamELO =
    elos.find((team) => team.abbrev === game.awayTeam.abbrev)?.elo || 0

  const homeWinProbability = calculateWinProbability(homeTeamELO, awayTeamELO)

  const awayWinProbability = 1 - homeWinProbability
  return { homeWinProbability, awayWinProbability }
}
