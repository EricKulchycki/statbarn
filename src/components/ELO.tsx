'use client'

import _ from 'lodash'
import { LatestELO } from '@/data/gameElo'
import { Team } from '@/types/team'
import Image from 'next/image'
import { useState } from 'react'
import { ShowAll } from './ShowAll'
import { useRouter } from 'next/navigation'

interface Props {
  elos: LatestELO[]
  teams: Team[]
}

export function ELO(props: Props) {
  const router = useRouter()

  const [showAll, setShowAll] = useState(false)

  const rankings = _.orderBy(props.elos, 'elo', 'desc')

  const visibleRankings = showAll ? rankings : rankings.slice(0, 10)

  return (
    <div className="p-4 sm:pt-0 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-400 tracking-wide">
        Power Rankings
      </h2>
      <div className="flex flex-col gap-4">
        {visibleRankings.map((elo, idx) => {
          if (elo.abbrev === 'ARI') {
            return null
          }
          const team = props.teams.find((team) => team.triCode === elo.abbrev)
          return (
            <div
              key={elo.abbrev}
              className="flex flex-wrap gap-2 items-center justify-between bg-gradient-to-br from-slate-800 to-slate-900 shadow-md p-4 rounded-2xl  hover:scale-[1.02] transition-transform cursor-pointer"
              onClick={() => router.push(`/historical/${elo.abbrev}`)}
            >
              <div className="flex items-center gap-3">
                <Image
                  src={team?.logo ?? ''}
                  alt={team?.triCode ?? ''}
                  className="w-10 h-10 rounded-full border-2 border-slate-700 bg-white/10 shadow"
                  width={40}
                  height={40}
                />
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-slate-100 tracking-wide">
                    {elo.abbrev}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-700 text-white font-bold text-md shadow">
                {elo.elo?.toFixed(0)} pts
              </span>
              <span className="ml-2 text-xs text-gray-400">#{idx + 1}</span>
            </div>
          )
        })}
      </div>
      <ShowAll showAll={showAll} setShowAll={setShowAll} />
    </div>
  )
}
