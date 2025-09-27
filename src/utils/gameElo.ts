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

export const getPredictedWinnerFromGameELO = (gameElo: GameELO) => {
  return gameElo.expectedResult.homeTeam > gameElo.expectedResult.awayTeam
    ? gameElo.homeTeam.abbrev
    : gameElo.awayTeam.abbrev
}

export const getActualWinnerFromGameELO = (gameElo: GameELO) => {
  const actualWinner =
    gameElo.homeTeam.score > gameElo.awayTeam.score
      ? gameElo.homeTeam.abbrev
      : gameElo.awayTeam.abbrev
  return actualWinner
}
