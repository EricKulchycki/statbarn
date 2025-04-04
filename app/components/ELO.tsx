import _ from 'lodash'
import { getCurrentNHLSeason } from 'utils/currentSeason'
import { SeasonELO } from '~/types/elo'
import { TeamLite } from '~/types/team'

interface Props {
  elos: SeasonELO[]
  teams: TeamLite[]
}

export function ELO(props: Props) {
  console.log(props.teams)
  return (
    <div className="text-white border-2 border-gray-500 rounded-lg p-4 m-8 w-1/4">
      <h2 className="text-lg font-semibold mb-4">
        ELO Ratings - {getCurrentNHLSeason()}
      </h2>
      {_.orderBy(props.elos, 'elo', 'desc').map((elo) => {
        const team = props.teams.find((team) => team.triCode === elo.abbrev)
        return (
          <div key={elo.abbrev} className="flex items-center mb-2">
            <div className="w-1/2 flex items-center">
              <img
                src={team?.logo}
                alt={team?.triCode}
                className="w-8 h-8 mr-2"
              />
              <p className="mr-4">{elo.abbrev}</p>
              <div className="h-[1px] border-[0.5px] w-full mr-2" />
            </div>
            <b className="justify-self-end">{elo.elo.toFixed(0)} pts</b>
          </div>
        )
      })}
    </div>
  )
}
