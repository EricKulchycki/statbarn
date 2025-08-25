import { NHLGame } from '@/types/game'
import { TeamLite } from '@/types/team'
import { Season } from '@/types/time'

interface GetGamesForTeamResponse {
  games: NHLGame[]
}

export async function fetchGamesForTeam(team: TeamLite, season: Season) {
  const res = await fetch(
    `https://api-web.nhle.com/v1/club-schedule-season/${team.triCode}/${season}`
  )
  const games: GetGamesForTeamResponse = await res.json()
  return games.games
}
