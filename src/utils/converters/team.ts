import { TeamDocument } from '@/models/team'
import { Team } from '@/types/team'

export function deserializeTeam(doc: TeamDocument): Team {
  return {
    id: doc.id,
    franchiseId: doc.franchiseId,
    fullName: doc.fullName,
    leagueId: doc.leagueId,
    rawTricode: doc.rawTricode,
    triCode: doc.triCode,
    logo: doc.logo,
  }
}
