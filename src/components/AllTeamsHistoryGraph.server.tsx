import { getTeams } from '@/data/teamsCache'
import { eloService } from '@/services/elo.service'
import { TeamSeasonGame } from '@/types/team'
import {
  AllTeamsHistoryGraph,
  TeamSeasonGameSerialized,
} from './AllTeamsHistoryGraph'

function serializeTeamGamesByTeam(data: {
  [abbrev: string]: TeamSeasonGame[]
}): { [abbrev: string]: TeamSeasonGameSerialized[] } {
  const result: { [abbrev: string]: TeamSeasonGameSerialized[] } = {}
  for (const [abbrev, games] of Object.entries(data)) {
    result[abbrev] = games.map((g) => ({
      ...g,
      gameDate:
        g.gameDate instanceof Date
          ? g.gameDate.toISOString()
          : String(g.gameDate),
    }))
  }
  return result
}

export async function AllTeamsHistoryGraphWrapper() {
  const historyByTeam = await eloService.getLeagueGameHistoryByTeam()
  const teams = await getTeams()
  return (
    <AllTeamsHistoryGraph
      teams={teams}
      historyByTeamSerialized={serializeTeamGamesByTeam(historyByTeam)}
    />
  )
}
