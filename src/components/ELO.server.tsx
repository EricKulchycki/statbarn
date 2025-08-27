import { eloService } from '@/services/elo.service'
import { ELO } from './ELO'
import { getTeams } from '@/data/teams'

export async function ELOWrapper() {
  const teams = await getTeams()
  const elos = await eloService.getLatestElos()

  return <ELO elos={elos} teams={teams} />
}
