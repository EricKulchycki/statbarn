import Image from 'next/image'
import { getTeamByAbbrev } from '@/data/teams'
import { eloService } from '@/services/elo.service'
import { Database } from '@/lib/db'

export default async function Team({
  params,
}: {
  params: Promise<{ team: string }>
}) {
  const db = Database.getInstance()
  await db.connect()

  const { team: teamAbbrev } = await params

  const team = await getTeamByAbbrev(teamAbbrev)

  const last10Games = await eloService.getLast10EloGames(
    teamAbbrev.toLowerCase()
  )

  console.log('Team data:', team)
  console.log('Last 10 ELO games:', last10Games)

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-md m-8">
      <div>
        <div className="flex items-center">
          <Image
            width={100}
            height={100}
            src={team?.logo || '/placeholder-logo.png'}
            alt={team?.triCode || 'Team Logo'}
            className="h-20 w-20 mb-4"
          />
          <h1 className="text-3xl font-bold mb-6">
            {team?.fullName || teamAbbrev}
          </h1>
        </div>
        <p>This is a placeholder for the team predictions page.</p>
      </div>
    </div>
  )
}
