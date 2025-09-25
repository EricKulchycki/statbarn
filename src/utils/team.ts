import { Team } from '@/types/team'

export function getTeamLogo(teams: Team[], abbrev: string): string | undefined {
  const team = teams.find((t) => t.triCode === abbrev)
  return team?.logo
}

export function getTeamFullName(
  teams: Team[],
  abbrev: string
): string | undefined {
  const team = teams.find((t) => t.triCode === abbrev)
  return team?.fullName
}
