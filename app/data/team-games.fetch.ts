import { NHLTeam } from '~/types/team'
import { Season } from '~/types/time'

interface GetGamesForTeamResponse {}

export async function fetchGamesForTeam(team: NHLTeam, season: Season) {
  const res = await fetch(
    `https://api-web.nhle.com/v1/club-schedule-season/${team.abbrev}/${season}`
  )
  const games: GetGamesForTeamResponse = await res.json()
  return games
}
