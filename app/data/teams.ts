import { TeamLite } from '~/types/team'
import { getStandings } from './standings'

export async function getTeams(): Promise<TeamLite[]> {
  const res = await fetch('https://api.nhle.com/stats/rest/en/team')
  const teams = await res.json()

  const standings = await getStandings()
  standings.forEach((team) => {
    const foundTeam = (teams.data as TeamLite[]).find(
      (t: TeamLite) => t.triCode === team.teamAbbrev.default
    )
    if (foundTeam) {
      foundTeam.logo = team.teamLogo
    }
  })
  return teams.data as TeamLite[]
}

export async function getTeamById(id: number): Promise<TeamLite | null> {
  const teams = await getTeams()
  const team = teams.find((team) => team.id === id)
  return team || null
}
