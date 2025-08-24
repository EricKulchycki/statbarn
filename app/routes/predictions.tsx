import { json, Link, MetaFunction, useLoaderData } from '@remix-run/react'
import { APP_CONFIG } from '~/constants'
import { getTeams } from '~/data/teams'

export const meta: MetaFunction = () => {
  return [
    { title: APP_CONFIG.name },
    { name: 'description', content: APP_CONFIG.description },
  ]
}

export async function loader() {
  const [teams] = await Promise.all([getTeams()])

  return json({
    teams: teams.sort((a, b) => a.fullName.localeCompare(b.fullName)),
  })
}

export default function PredictionsPage() {
  const { teams } = useLoaderData<typeof loader>()

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Team Predictions</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-8">
        {teams.map((team) => {
          if (!team.logo) return null

          return (
            <button
              key={team.triCode}
              className={`p-4 rounded-lg shadow hover:bg-slate-700 transition bg-slate-800`}
            >
              <Link to={`/predictions/${team.triCode}`} key={team.triCode}>
                {team.logo && (
                  <img
                    src={team.logo}
                    alt={team.triCode}
                    className="h-10 mx-auto mb-2"
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
