import { getTeams } from '@/data/teamsCache'
import { getDaySlates, resolveSelectedDate } from '@/lib/daySlate'
import { GameSlate } from './GameSlate'

interface Props {
  requestedDate?: string
}

export async function DaySlate({ requestedDate }: Props) {
  const [{ slates, todayIso, gamesById, predictionsById }, teams] =
    await Promise.all([getDaySlates(), getTeams()])
  const selected = resolveSelectedDate(requestedDate, slates, todayIso)
  const slate = slates.find((s) => s.date === selected)

  if (!slate) {
    return (
      <p className="my-4 text-sm text-gray-400">
        No games scheduled. The season may be complete.
      </p>
    )
  }

  return (
    <GameSlate
      slate={slate}
      gamesById={gamesById}
      predictionsById={predictionsById}
      teams={teams}
    />
  )
}
