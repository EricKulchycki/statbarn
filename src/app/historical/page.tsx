import { getTeams } from '@/data/teams'
import { Database } from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'

export default async function PredictionsPage() {
  const db = Database.getInstance()
  await db.connect()

  const [teams] = await Promise.all([getTeams()])

  return (
    <div className="max-w-5xl mx-auto py-8 px-2">
      <h1 className="text-2xl font-bold mb-6">Teams</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-8">
        {teams.map((team) => {
          if (!team.logo) return null

          return (
            <button
              key={team.triCode}
              className={`p-4 rounded-lg shadow hover:bg-slate-700 transition bg-slate-800`}
            >
              <Link href={`/historical/${team.triCode}`} key={team.triCode}>
                {team.logo && (
                  <Image
                    width={80}
                    height={80}
                    src={team.logo}
                    alt={team.triCode}
                    className="h-10 w-10 mx-auto mb-2"
                  />
                )}
              </Link>
            </button>
          )
        })}
      </div>
    </div>
  )
}
