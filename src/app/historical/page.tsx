import { getTeams } from '@/data/teams'
import { Database } from '@/lib/db'
import { eloService } from '@/services/elo.service'
import { TeamsRankings } from '@/components/TeamsRankings'

export default async function TeamsPage() {
  const db = Database.getInstance()
  await db.connect()

  const [teams, elos] = await Promise.all([
    getTeams(),
    eloService.getLatestElos(),
  ])

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          NHL Power Rankings
        </h1>
        <p className="text-gray-400">
          Teams ranked by ELO rating - Click on any team to view their history
        </p>
      </div>

      <TeamsRankings elos={elos} teams={teams} />
    </div>
  )
}
