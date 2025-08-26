import { GameELO } from '@/models/gameElo'

export const getOpponent = (gameElo: GameELO, teamAbbrev: string) => {
  if (gameElo.homeTeam.abbrev === teamAbbrev) {
    return gameElo.awayTeam
  } else {
    return gameElo.homeTeam
  }
}

export const getSelf = (gameElo: GameELO, teamAbbrev: string) => {
  if (gameElo.homeTeam.abbrev === teamAbbrev) {
    return gameElo.homeTeam
  } else {
    return gameElo.awayTeam
  }
}
