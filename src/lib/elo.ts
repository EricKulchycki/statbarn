import _ from 'lodash'
// import { PredictionModel } from 'models/prediction'
import { getStartOfDay } from '@/utils/currentSeason'

import { fetchGamesForTeam } from '@/data/team-games.fetch'
import { SeasonELO } from '@/types/elo'
import { NHLGame } from '@/types/game'
import { Team } from '@/types/team'
import { Season } from '@/types/time'
import { LatestELO } from '@/data/gameElo'

export const calculateWinProbability = (
  homeELO: number,
  awayELO: number
): number => {
  const eloDifference = homeELO - awayELO
  return 1 / (1 + Math.pow(10, -eloDifference / 400))
}

const K = 32

export interface ELOResults {
  [abbrev: string]: number
}

/* 
  date is used to limit to a certain date within the season
*/
export async function calculateSeasonELO(
  season: Season,
  teams: Team[],
  lastSeasonData: LatestELO[] = [],
  date: Date = new Date(),
  model: 'realtime' | 'v1' = 'realtime'
) {
  const elos: ELOResults = {}

  teams.forEach((team) => {
    elos[team.triCode] =
      lastSeasonData.find((elo) => elo.abbrev === team.triCode)?.elo ?? 1500
  })

  const gamesDA = await Promise.all(
    teams.map(async (team) => {
      const games = await fetchGamesForTeam(team, season)
      if (games.length > 0) {
        return games
      }
      return []
    })
  )

  // only regular season games
  const seasonGames = gamesDA.flat().filter((game) => game.gameType === 2)

  _.orderBy(seasonGames, 'startTimeUTC').map((game) => {
    if (
      new Date(game.startTimeUTC) > getStartOfDay(new Date()) ||
      new Date(game.startTimeUTC) > date ||
      game.gameState !== 'OFF'
    ) {
      return
    }
    elos[game.homeTeam.abbrev] = calcHomeTeamELO(game, elos)
    elos[game.awayTeam.abbrev] = calcAwayTeamELO(game, elos)

    return createPrediction(game, elos, model)
  })

  // await PredictionModel.insertMany(predictions.filter((p) => p != null))

  const elosList: SeasonELO[] = Object.keys(elos)
    .map((key) => {
      return {
        abbrev: key,
        elo: elos[key],
        season: {
          startYear: parseInt(season.substring(0, 4)),
          endYear: parseInt(season.substring(4, 8)),
        },
      }
    })
    .filter((elo) => elo.elo !== 1500)

  return _.orderBy(elosList, 'elo')
}

export function createPrediction(
  game: NHLGame,
  elos: ELOResults,
  model: string
) {
  const winProb = calculateWinProbability(
    elos[game.homeTeam.abbrev],
    elos[game.awayTeam.abbrev]
  )

  const gameWinner =
    game.homeTeam.score > game.awayTeam.score
      ? game.homeTeam.abbrev
      : game.awayTeam.abbrev

  const predictedWinner =
    winProb > 0.5 ? game.homeTeam.abbrev : game.awayTeam.abbrev

  return {
    gameId: game.id,
    homeTeam: game.homeTeam.abbrev,
    awayTeam: game.awayTeam.abbrev,
    predictedWinner,
    homeTeamWinProbability: winProb,
    awayTeamWinProbability: 1 - winProb,
    gameDate: new Date(game.startTimeUTC),
    modelVersion: model,
    result: {
      homeTeamScore: game.homeTeam.score,
      awayTeamScore: game.awayTeam.score,
      winner: gameWinner,
      correctPrediction: predictedWinner === gameWinner,
    },
  }
}

function calcHomeTeamELO(game: NHLGame, elos: ELOResults) {
  const goalDiff = Math.abs(game.awayTeam.score - game.homeTeam.score)
  let adjustedK = K
  if (goalDiff) {
    adjustedK = K * (1 + goalDiff * 0.1) // Adjust K based on goal difference
    adjustedK = adjustedK > 100 ? 100 : adjustedK // Cap K at 100
  }

  return (
    elos[game.homeTeam.abbrev] +
    adjustedK *
      (didTeamWin(game, 'homeTeam') -
        calculateExpectedResult(game, elos, 'homeTeam'))
  )
}

function calcAwayTeamELO(game: NHLGame, elos: ELOResults) {
  const goalDiff = Math.abs(game.awayTeam.score - game.homeTeam.score)
  let adjustedK = K
  if (goalDiff) {
    adjustedK = K * (1 + goalDiff * 0.18) // Adjust K based on goal difference
    adjustedK = adjustedK > 100 ? 100 : adjustedK // Cap K at 100
  }

  return (
    elos[game.awayTeam.abbrev] +
    adjustedK *
      (didTeamWin(game, 'awayTeam') -
        calculateExpectedResult(game, elos, 'awayTeam'))
  )
}

function calculateExpectedResult(
  game: NHLGame,
  elos: ELOResults,
  teamKey: 'homeTeam' | 'awayTeam'
): number {
  const opponentKey = teamKey === 'homeTeam' ? 'awayTeam' : 'homeTeam'
  const homeAdvFactor = 150 // home ice advantage
  let opponentElo = elos[game[opponentKey].abbrev]
  if (opponentKey === 'homeTeam') {
    opponentElo += homeAdvFactor // add home ice advantage
  }
  let teamElo = elos[game[teamKey].abbrev]
  if (teamKey === 'homeTeam') {
    teamElo += homeAdvFactor // add home ice advantage
  }
  const ratingDiff = opponentElo - teamElo
  return 1 / (1 + Math.pow(10, ratingDiff / 400))
}

function didTeamWin(game: NHLGame, teamKey: 'homeTeam' | 'awayTeam'): 1 | 0 {
  if (
    game[teamKey].score >
    game[teamKey === 'homeTeam' ? 'awayTeam' : 'homeTeam'].score
  ) {
    return 1
  }
  return 0
}
