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
  return (
    elos[game.homeTeam.abbrev] +
    K *
      (didTeamWin(game, 'homeTeam') -
        calculateExpectedResult(game, elos, 'homeTeam'))
  )
}

function calcAwayTeamELO(game: NHLGame, elos: ELOResults) {
  return (
    elos[game.awayTeam.abbrev] +
    K *
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
  return (
    1 /
    (1 +
      Math.pow(
        10,
        (elos[game[opponentKey].abbrev] - elos[game[teamKey].abbrev]) / 400
      ))
  )
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
