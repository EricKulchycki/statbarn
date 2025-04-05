import _ from 'lodash'

import { fetchGamesForTeam } from '~/data/team-games.fetch'
import { SeasonELO } from '~/types/elo'
import { NHLGame } from '~/types/game'
import { TeamLite } from '~/types/team'
import { Season } from '~/types/time'

const K = 32

interface ELOResults {
  [abbrev: string]: number
}

export async function calculateSeasonELO(
  season: Season,
  teams: TeamLite[],
  lastSeasonData: SeasonELO[] = []
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

  _.orderBy(seasonGames, 'startTimeUTC').forEach((game) => {
    if (game.startTimeUTC > new Date().toISOString()) {
      return
    }
    elos[game.homeTeam.abbrev] = calcHomeTeamELO(game, elos)
    elos[game.awayTeam.abbrev] = calcAwayTeamELO(game, elos)
  })

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
