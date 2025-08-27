'use client'

import _ from 'lodash'
import { LatestELO } from '@/data/gameElo'
import { TeamLite } from '@/types/team'
import Image from 'next/image'
import { useState } from 'react'
import { ShowAll } from './ShowAll'

interface Props {
  elos: LatestELO[]
  teams: TeamLite[]
}

export function ELO(props: Props) {
  const [showAll, setShowAll] = useState(false)

  const rankings = _.orderBy(props.elos, 'elo', 'desc')

  const visibleRankings = showAll ? rankings : rankings.slice(0, 15)

  return (
    <div className="p-4 mb-8">
      <h2 className="text-lg font-semibold mb-4">Power Rankings</h2>
      {visibleRankings.map((elo) => {
        if (elo.abbrev === 'ARI') {
          return null
        }
        const team = props.teams.find((team) => team.triCode === elo.abbrev)
        return (
          <div
            key={elo.abbrev}
            className="flex items-center justify-between mb-2 bg-gray-800 p-2 rounded-xl"
          >
            <div className="flex-1 flex items-center">
              <Image
                src={team?.logo ?? ''}
                alt={team?.triCode ?? ''}
                className="w-8 h-8 mr-2"
                width={32}
                height={32}
              />
              <p className="mr-4">{elo.abbrev}</p>
            </div>
            <b className="justify-self-end">{elo.elo?.toFixed(0)} pts</b>
          </div>
        )
      })}
      <ShowAll showAll={showAll} setShowAll={setShowAll} />
    </div>
  )
}
