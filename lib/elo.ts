import _ from 'lodash'

import { fetchGamesForTeam } from '~/data/team-games.fetch'
import { NHLGame } from '~/types/game'
import { TeamLite } from '~/types/team'
import { Season } from '~/types/time'

const K = 25

interface ELOResults {
  [abbrev: string]: number
}

export async function calculateSeasonELO(season: Season, teams: TeamLite[]) {
  const elos: ELOResults = {}

  teams.forEach((team) => {
    elos[team.triCode] = 1500
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
    elos[game.homeTeam.abbrev] = calcHomeTeamELO(game, elos)
    elos[game.awayTeam.abbrev] = calcAwayTeamELO(game, elos)
  })

  console.log(_.pickBy(elos, (elo) => elo !== 1500))
}

function calcHomeTeamELO(game: NHLGame, elos: ELOResults) {
  return (
    elos[game.homeTeam.abbrev] +
    K * (didHomeTeamWin(game) - calculateHomeExpectedResult(game, elos))
  )
}

function calcAwayTeamELO(game: NHLGame, elos: ELOResults) {
  return (
    elos[game.awayTeam.abbrev] +
    K * (didAwayTeamWin(game) - calculateAwayExpectedResult(game, elos))
  )
}

function calculateHomeExpectedResult(game: NHLGame, elos: ELOResults) {
  return (
    1 /
    (1 +
      Math.pow(
        10,
        (elos[game.awayTeam.abbrev] - elos[game.homeTeam.abbrev]) / 400
      ))
  )
}

function calculateAwayExpectedResult(game: NHLGame, elos: ELOResults) {
  return (
    1 /
    (1 +
      Math.pow(
        10,
        (elos[game.homeTeam.abbrev] - elos[game.awayTeam.abbrev]) / 400
      ))
  )
}

function didHomeTeamWin(game: NHLGame): 1 | 0 {
  if (game.homeTeam.score > game.awayTeam.score) {
    return 1
  }
  return 0
}

function didAwayTeamWin(game: NHLGame): 1 | 0 {
  if (game.homeTeam.score < game.awayTeam.score) {
    return 1
  }
  return 0
}
