import { Team } from '@/types/team'
import { TeamModel } from '@/models/team'
import { toDomainTeam } from '@/utils/converters/team'

export async function getTeams(): Promise<Team[]> {
  const teamModel = await TeamModel.find().exec()

  return teamModel.map(toDomainTeam)
}

export async function getTeamById(id: number): Promise<Team | null> {
  const team = await TeamModel.findOne({ id }).exec()
  return team ? toDomainTeam(team) : null
}

export async function getTeamByAbbrev(abbrev: string): Promise<Team | null> {
  const team = await TeamModel.findOne({ triCode: abbrev }).exec()
  return team ? toDomainTeam(team) : null
}
