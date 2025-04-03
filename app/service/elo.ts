import { fetchGamesForTeam } from '~/data/team-games.fetch'
import { NHLGame } from '~/types/game'
import { NHLTeam } from '~/types/team'
import { Season } from '~/types/time'

export interface ELO {
  team: NHLTeam

  getTeamsGamesForSeason(season: Season): Promise<NHLGame[]>
}

export class ELOImpl implements ELO {
  team: NHLTeam

  constructor(team: NHLTeam) {
    this.team = team
  }

  async getTeamsGamesForSeason(season: Season) {
    const games = await fetchGamesForTeam(this.team, season)

    console.log(games)
    return []
  }
}
