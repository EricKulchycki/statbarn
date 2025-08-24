import _ from 'lodash'
import { getCurrentNHLSeason } from 'utils/currentSeason'
import { LatestELO } from '~/data/latest-elo.get'
import { TeamLite } from '~/types/team'

interface Props {
  elos: LatestELO[]
  teams: TeamLite[]
}

export function ELO(props: Props) {
  return (
    <div className="p-4 mb-8">
      <h2 className="text-lg font-semibold mb-4">
        {getCurrentNHLSeason()} ELO Ratings
      </h2>
      {_.orderBy(props.elos, 'elo', 'desc').map((elo) => {
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
              <img
                src={team?.logo}
                alt={team?.triCode}
                className="w-8 h-8 mr-2"
              />
              <p className="mr-4">{elo.abbrev}</p>
            </div>
            <b className="justify-self-end">{elo.elo?.toFixed(0)} pts</b>
          </div>
        )
      })}
    </div>
  )
}
