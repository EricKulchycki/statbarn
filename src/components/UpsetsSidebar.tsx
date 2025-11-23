import { upsetService } from '@/services/upset.service'
import { getTeams } from '@/data/teams'
import Image from 'next/image'
import { getTeamFullName, getTeamLogo } from '@/utils/team'
import { eloService } from '@/services/elo.service'
import { SeasonSelector } from './SeasonSelector'
import { splitAtIndex } from '@/utils'
import { UpsetByWeekChart } from './UpsetsByWeekChart'
import { serializeUpset } from '@/utils/converters/upset'
import { Team } from '@/types/team'

export default async function SeasonUpsetSidebar({
  season,
}: {
  season: number
}) {
  const seasonUpsets = await upsetService.getSeasonsUpsets(
    Number(season) || 20252026
  )
  const teams = await getTeams()
  const seasonsGames = await eloService.countSeasonsGames(
    Number(season) || 20252026
  )
  const totalUpsets = seasonUpsets.length

  // Count upsets per team
  // these are the teams that have caused the most upsets
  const teamUpsetCounts: Record<string, number> = {}
  seasonUpsets.forEach((u) => {
    teamUpsetCounts[u.actualWinner] = (teamUpsetCounts[u.actualWinner] || 0) + 1
  })
  const topUpsetTeams = Object.entries(teamUpsetCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const mostUpsetTeams: Record<string, number> = {}
  seasonUpsets.forEach((u) => {
    mostUpsetTeams[u.predictedWinner] =
      (mostUpsetTeams[u.predictedWinner] || 0) + 1
  })
  const topMostUpsetTeams = Object.entries(mostUpsetTeams)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  // Upset distribution by month
  const upsetMonths: Record<string, number> = {}
  seasonUpsets.forEach((u) => {
    const month = u.date.toLocaleString({ month: 'short' })
    upsetMonths[month] = (upsetMonths[month] || 0) + 1
  })

  return (
    <aside className="w-full rounded-xl shadow-lg">
      <h2 className="text-3xl font-extrabold mb-6 tracking-tight pb-8">
        {splitAtIndex(season.toString(), 4).join('/')} Season Upsets
      </h2>
      <SeasonSelector currentSeason={season} />
      <div className="flex justify-between mb-6 gap-8 flex-wrap">
        <div className="flex items-center gap-8 flex-wrap">
          <UpsetTeamList
            upsetTeams={topUpsetTeams}
            title="Most Successful Underdogs"
            teams={teams}
          />
          <UpsetTeamList
            upsetTeams={topMostUpsetTeams}
            title="Most Upset Teams"
            teams={teams}
          />
        </div>
        <div className="p-4 mb-6 bg-slate-800 rounded-lg">
          <div className="mb-4">
            <div className="text-lg font-semibold text-slate-200">
              Total Upsets
            </div>
            <div className="text-3xl font-bold text-red-400">
              <span>{totalUpsets}</span>
              <span className="text-white mx-2">/</span>
              <span className="text-blue-600">{seasonsGames}</span>
            </div>
            <div className="text-sm text-gray-400">
              {((totalUpsets / seasonsGames) * 100).toFixed(1)}% of games
            </div>
          </div>
        </div>
      </div>
      <UpsetByWeekChart serializedUpsets={seasonUpsets.map(serializeUpset)} />
    </aside>
  )
}

function UpsetTeamList({
  upsetTeams,
  title,
  teams,
}: {
  upsetTeams: [string, number][]
  title: string
  teams: Team[]
}) {
  return (
    <div className="flex justify-between mb-6 gap-8">
      <div className="mb-4">
        <div className="text-lg font-semibold text-slate-200">{title}</div>
        <ul className="mt-2">
          {upsetTeams.map(([team, count]) => (
            <li key={team} className="flex items-center mb-1">
              {getTeamLogo(teams, team) ? (
                <Image
                  src={getTeamLogo(teams, team)!}
                  alt={team}
                  width={24}
                  height={24}
                  className="rounded-full bg-slate-700 mr-2"
                />
              ) : (
                <span className="w-6 h-6 rounded-full bg-slate-700 mr-2 flex items-center justify-center text-xs text-gray-400">
                  ?
                </span>
              )}
              <span className="text-slate-100 font-semibold mr-2">
                {getTeamFullName(teams, team)}
              </span>
              <span className="text-red-300 font-bold">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
