import { Team } from '@/types/team'
import { getStandings } from './standings'

export async function getTeams(): Promise<Team[]> {
  const res = await fetch('https://api.nhle.com/stats/rest/en/team')
  const teams = await res.json()

  const standings = await getStandings()
  standings.forEach((team) => {
    const foundTeam = (teams.data as Team[]).find(
      (t: Team) => t.triCode === team.teamAbbrev.default
    )
    if (foundTeam) {
      foundTeam.logo = team.teamLogo
    }
  })
  return teams.data as Team[]
}

export async function getTeamById(id: number): Promise<Team | null> {
  const teams = await getTeams()
  const team = teams.find((team) => team.id === id)
  return team || null
}

export async function getTeamByAbbrev(abbrev: string): Promise<Team | null> {
  const teams = await getTeams()
  const team = teams.find((team) => team.triCode === abbrev)
  return team || null
}
