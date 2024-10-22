import { NHLGameDay } from '~/types/game'
import { TodaysGames } from './TodaysGames'

interface Props {
  gamesThisWeek: NHLGameDay[]
}

export function GameBanner(props: Props) {
  const { gamesThisWeek } = props

  return (
    <div className="flex">
      {gamesThisWeek.map((gw) => (
        <TodaysGames key={gw.date} games={gw.games} />
      ))}
    </div>
  )
}
