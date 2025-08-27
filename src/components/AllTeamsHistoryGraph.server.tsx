import { eloService } from '@/services/elo.service'
import { AllTeamsHistoryGraph } from './AllTeamsHistoryGraph'
import { serializeGameELOByTeam } from '@/utils/converters/gameElo'

export async function AllTeamsHistoryGraphWrapper() {
  const historyByTeam = await eloService.getLeagueGameEloHistoryByTeam()
  return (
    <AllTeamsHistoryGraph
      historyByTeamSerialized={serializeGameELOByTeam(historyByTeam)}
    />
  )
}
