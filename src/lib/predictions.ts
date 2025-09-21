import { NHLGame } from '@/types/game'
import { calculateWinProbability } from './elo'
import { LatestELO } from '@/data/gameElo'
import { Prediction } from '@/models/prediction'

export function calculateGamePrediction(elos: LatestELO[], game: NHLGame) {
  const homeTeamELO =
    elos.find((team) => team.abbrev === game.homeTeam.abbrev)?.elo || 0
  const awayTeamELO =
    elos.find((team) => team.abbrev === game.awayTeam.abbrev)?.elo || 0

  const homeWinProbability = calculateWinProbability(homeTeamELO, awayTeamELO)

  const awayWinProbability = 1 - homeWinProbability
  return { homeWinProbability, awayWinProbability }
}

export function groupPredictionsByDate(predictions: Prediction[]) {
  const map: { [date: string]: Prediction[] } = {}
  for (const pred of predictions) {
    const localDate = new Date(pred.gameDate).toString().slice(0, 10)
    if (!map[localDate]) map[localDate] = []
    map[localDate].push(pred)
  }
  return map
}
