import { upsetService } from '@/services/upset.service'
import { getTeams } from '@/data/teams'
import { DateTime } from 'luxon'
import Image from 'next/image'
import React from 'react'
import SeasonUpsetSidebar from '@/components/UpsetsSidebar'
import { getTeamLogo } from '@/utils/team'

export default async function UpsetTracker({
  searchParams,
}: PageProps<'/upsets'>) {
  const sp = await searchParams
  const upsets = await upsetService.getAllUpsets(
    DateTime.now().minus({ days: 7 })
  )
  const teams = await getTeams()

  return (
    <div className="flex gap-8 max-w-[70%] p-8 mx-auto">
      <div className="w-5/8">
        <h2 className="text-3xl font-extrabold mb-6 tracking-tight">
          Recent Upsets
        </h2>
        <h6 className="text-lg font-semibold mb-4">Last 7 Days</h6>
        <div className="space-y-4">
          {upsets.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No upsets in the last 7 days.
            </div>
          )}
          {upsets.map((upset) => (
            <div
              key={upset.gameId}
              className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow "
            >
              {/* Date */}
              <div className="w-24 text-center mr-4">
                <div className="text-xs text-gray-400 font-medium mb-1">
                  {upset.date.toLocaleString(DateTime.DATE_MED)}
                </div>
                <div className="text-lg font-bold text-slate-200">
                  {upset.homeScore} - {upset.awayScore}
                </div>
              </div>
              <div className="flex items-center">
                {/* Home Team */}
                <div className="flex items-center  gap-2">
                  <span className="font-semibold text-slate-100">
                    {upset.homeTeam}
                  </span>
                  {getTeamLogo(teams, upset.homeTeam) ? (
                    <Image
                      src={getTeamLogo(teams, upset.homeTeam)!}
                      alt={upset.homeTeam}
                      width={48}
                      height={48}
                      className="rounded-full bg-slate-700 p-1"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 mr-2 flex items-center justify-center text-xs text-gray-400">
                      ?
                    </div>
                  )}
                </div>
                <span className="mx-2 text-gray-400 font-bold">vs</span>
                {/* Away Team */}
                <div className="flex items-center mr-2 gap-1">
                  {getTeamLogo(teams, upset.awayTeam) ? (
                    <Image
                      src={getTeamLogo(teams, upset.awayTeam)!}
                      alt={upset.awayTeam}
                      width={48}
                      height={48}
                      className="rounded-full bg-slate-700 mr-2 p-1"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 mr-2 flex items-center justify-center text-xs text-gray-400">
                      ?
                    </div>
                  )}
                  <span className="font-semibold text-slate-100">
                    {upset.awayTeam}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                {/* Predicted Winner */}
                <div className="ml-4">
                  <span className="px-2 py-1 rounded bg-blue-900 text-blue-300 text-xs font-bold">
                    Predicted: {upset.predictedWinner}
                  </span>
                </div>
                {/* Actual Winner */}
                <div className="ml-2">
                  <span className="px-2 py-1 rounded bg-red-900 text-red-300 text-xs font-bold">
                    Actual: {upset.actualWinner}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <SeasonUpsetSidebar season={Number(sp.season ?? 20252026)} />
      </div>
    </div>
  )
}
