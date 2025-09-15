import { eloService } from '@/services/elo.service'
import { AllTeamsHistoryGraph } from './AllTeamsHistoryGraph'
import { serializeGameELOByTeam } from '@/utils/converters/gameElo'
import { getTeams } from '@/data/teams'

export async function AllTeamsHistoryGraphWrapper() {
  const historyByTeam = await eloService.getLeagueGameEloHistoryByTeam()
  const teams = await getTeams()
  return (
    <AllTeamsHistoryGraph
      teams={teams}
      historyByTeamSerialized={serializeGameELOByTeam(historyByTeam)}
    />
  )
}
