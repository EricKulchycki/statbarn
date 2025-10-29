import { upsetService } from '@/services/upset.service'
import { getTeams } from '@/data/teams'
import Image from 'next/image'
import { getTeamFullName, getTeamLogo } from '@/utils/team'
import { eloService } from '@/services/elo.service'
import { SeasonSelector } from './SeasonSelector'
import { splitAtIndex } from '@/utils'
import { UpsetByWeekChart } from './UpsetsByWeekChart'
import { serializeUpset } from '@/utils/converters/upset'

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
  const teamUpsetCounts: Record<string, number> = {}
  seasonUpsets.forEach((u) => {
    teamUpsetCounts[u.actualWinner] = (teamUpsetCounts[u.actualWinner] || 0) + 1
  })
  const topUpsetTeams = Object.entries(teamUpsetCounts)
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
      <div className="flex justify-between mb-6 gap-8">
        <div className="mb-4">
          <div className="text-lg font-semibold text-slate-200">
            Top Upset Teams
          </div>

          <ul className="mt-2">
            {topUpsetTeams.map(([team, count]) => (
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
      <UpsetByWeekChart serializedUpsets={seasonUpsets.map(serializeUpset)} />
      {/* <div className="space-y-2">
        {seasonUpsets.slice(0, 20).map((upset) => (
          <div
            key={upset.gameId}
            className="flex items-center justify-between bg-slate-800 rounded-lg p-2 shadow"
          >
            <div className="w-20 text-xs text-gray-400">
              {upset.date.toLocaleString(DateTime.DATE_MED)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-100 text-xs">{upset.homeTeam}</span>
              <div className="flex items-center gap-1">
                {getTeamLogo(teams, upset.homeTeam) ? (
                  <Image
                    src={getTeamLogo(teams, upset.homeTeam)!}
                    alt={upset.homeTeam}
                    width={20}
                    height={20}
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-slate-700 mr-1 flex items-center justify-center text-xs text-gray-400">
                    ?
                  </span>
                )}
              </div>
              <span className="mx-1 text-gray-400 text-xs">vs</span>
              <div className="flex items-center gap-1">
                {getTeamLogo(teams, upset.awayTeam) ? (
                  <Image
                    src={getTeamLogo(teams, upset.awayTeam)!}
                    alt={upset.awayTeam}
                    width={20}
                    height={20}
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-slate-700 mr-1 flex items-center justify-center text-xs text-gray-400">
                    ?
                  </span>
                )}
                <span className="text-slate-100 text-xs">{upset.awayTeam}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="ml-2 px-2 py-1 rounded bg-blue-900 text-blue-300 text-xs font-bold">
                Predicted: {upset.predictedWinner}
              </span>
              <span className="ml-2 px-2 py-1 rounded bg-red-900 text-red-300 text-xs font-bold">
                Actual: {upset.actualWinner}
              </span>
            </div>
          </div>
        ))}
      </div> */}
    </aside>
  )
}
