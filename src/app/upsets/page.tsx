import { upsetService } from '@/services/upset.service'
import { getTeams } from '@/data/teams'
import { DateTime } from 'luxon'
import Image from 'next/image'
import React from 'react'
import SeasonUpsetSidebar from '@/components/UpsetsSidebar'
import { getTeamLogo } from '@/utils/team'
import { Database } from '@/lib/db'

export default async function UpsetTracker({
  searchParams,
}: PageProps<'/upsets'>) {
  const db = Database.getInstance()
  await db.connect()

  const sp = await searchParams
  const upsets = await upsetService.getAllUpsets(
    DateTime.now().minus({ days: 7 })
  )
  const teams = await getTeams()

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:max-w-[70%] sm:max-w-full p-4 sm:p-2 mx-auto flex-wrap">
      <div className="w-full lg:flex-1 mt-8 lg:mt-0">
        <SeasonUpsetSidebar season={Number(sp.season ?? 20252026)} />
      </div>
      <div className="w-full lg:w-4/8">
        <h2 className="text-2xl lg:text-3xl font-extrabold mb-4 lg:mb-6 tracking-tight">
          Recent Upsets
        </h2>
        <h6 className="text-base lg:text-lg font-semibold mb-2 lg:mb-4">
          Last 7 Days
        </h6>
        <div className="space-y-4">
          {upsets.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No upsets in the last 7 days.
            </div>
          )}
          {upsets.map((upset) => (
            <div
              key={upset.gameId}
              className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow w-full"
            >
              {/* Date & Score */}
              <div className="w-full sm:w-24 text-center sm:mr-4 mb-2 sm:mb-0">
                <div className="text-xs text-gray-400 font-medium mb-1">
                  {upset.date.toLocaleString(DateTime.DATE_MED)}
                </div>
                <div className="text-lg font-bold text-slate-200">
                  {upset.homeScore} - {upset.awayScore}
                </div>
              </div>
              {/* Teams */}
              <div className="flex items-center justify-center w-full sm:w-auto mb-2 sm:mb-0">
                {/* Home Team */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-100">
                    {upset.homeTeam}
                  </span>
                  {getTeamLogo(teams, upset.homeTeam) ? (
                    <Image
                      src={getTeamLogo(teams, upset.homeTeam)!}
                      alt={upset.homeTeam}
                      width={40}
                      height={40}
                      className="rounded-full bg-slate-700 p-1"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-gray-400">
                      ?
                    </div>
                  )}
                </div>
                <span className="mx-2 text-gray-400 font-bold">vs</span>
                {/* Away Team */}
                <div className="flex items-center gap-2">
                  {getTeamLogo(teams, upset.awayTeam) ? (
                    <Image
                      src={getTeamLogo(teams, upset.awayTeam)!}
                      alt={upset.awayTeam}
                      width={40}
                      height={40}
                      className="rounded-full bg-slate-700 p-1"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-gray-400">
                      ?
                    </div>
                  )}
                  <span className="font-semibold text-slate-100">
                    {upset.awayTeam}
                  </span>
                </div>
              </div>
              {/* Prediction Info */}
              <div className="flex flex-row items-center justify-center w-full sm:w-auto mt-2 sm:mt-0">
                <span className="px-2 py-1 rounded bg-blue-900 text-blue-300 text-xs font-bold mr-2">
                  Predicted: {upset.predictedWinner}
                </span>
                <span className="px-2 py-1 rounded bg-red-900 text-red-300 text-xs font-bold">
                  Actual: {upset.actualWinner}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
