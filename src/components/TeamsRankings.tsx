'use client'

import _ from 'lodash'
import { LatestELO } from '@/data/gameElo'
import { Team } from '@/types/team'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronDownIcon } from '@heroicons/react/24/solid'

interface Props {
  elos: LatestELO[]
  teams: Team[]
}

export function TeamsRankings({ elos, teams }: Props) {
  const router = useRouter()

  const rankings = _.orderBy(elos, 'elo', 'desc').filter(
    (elo) => elo.abbrev !== 'ARI'
  )

  const getEloColor = (rank: number) => {
    if (rank <= 5)
      return 'from-green-900/40 to-green-950/20 border-green-700/50'
    if (rank <= 10) return 'from-blue-900/40 to-blue-950/20 border-blue-700/50'
    if (rank <= 20) return 'from-slate-800 to-slate-900 border-slate-700'
    return 'from-red-900/40 to-red-950/20 border-red-700/50'
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 5) return 'bg-green-600'
    if (rank <= 10) return 'bg-blue-600'
    if (rank <= 20) return 'bg-slate-600'
    return 'bg-red-600'
  }

  return (
    <div className="space-y-3">
      {rankings.map((elo, idx) => {
        const rank = idx + 1
        const team = teams.find((team) => team.triCode === elo.abbrev)

        if (!team) return null

        return (
          <div
            key={elo.abbrev}
            className={`relative group cursor-pointer bg-gradient-to-r ${getEloColor(rank)} border rounded-xl p-4 hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl`}
            onClick={() => router.push(`/historical/${elo.abbrev}`)}
          >
            <div className="flex items-center justify-between">
              {/* Left side - Rank and Team Info */}
              <div className="flex items-center gap-4 flex-1">
                {/* Rank Badge */}
                <div
                  className={`flex-shrink-0 w-12 h-12 ${getRankBadgeColor(rank)} rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-md`}
                >
                  {rank}
                </div>

                {/* Team Logo and Name */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <Image
                      src={team.logo ?? ''}
                      alt={team.triCode ?? ''}
                      className="w-14 h-14 rounded-full border-2 border-slate-600 bg-white/5 shadow-lg"
                      width={56}
                      height={56}
                    />
                  </div>

                  <div className="flex flex-col">
                    <span className="font-bold text-xl text-white tracking-wide">
                      {team.fullName}
                    </span>
                    <span className="text-sm text-gray-400">
                      {team.triCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side - ELO Rating */}
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-sm text-gray-400 mb-1">ELO Rating</div>
                  <div className="text-2xl font-bold text-white">
                    {elo.elo?.toFixed(0)}
                  </div>
                </div>

                {/* Mobile ELO */}
                <div className="sm:hidden px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600">
                  <div className="text-lg font-bold text-white">
                    {elo.elo?.toFixed(0)}
                  </div>
                </div>

                {/* Chevron indicator */}
                <ChevronDownIcon className="size-5 text-gray-500 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
