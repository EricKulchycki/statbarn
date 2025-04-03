import { TeamLite } from '~/types/team'

export async function getTeams(): Promise<TeamLite[]> {
  const res = await fetch('https://api.nhle.com/stats/rest/en/team')
  const teams = await res.json()
  return teams.data as TeamLite[]
}
