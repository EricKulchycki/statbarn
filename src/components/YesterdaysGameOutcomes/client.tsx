'use client'

import { GameScheduleTable } from '@/components/GameScheduleTable'
import { GamePrediction } from '@/types/gamePrediction'
import { Team } from '@/types/team'
import { toScheduleRowFromCompletedGame } from '@/utils/gameSchedule'

interface Props {
  games: GamePrediction[]
  teams: Team[]
}

export function YesterdaysGameOutcomes({ games, teams }: Props) {
  const rows = games.map(toScheduleRowFromCompletedGame)

  return <GameScheduleTable rows={rows} teams={teams} interactive={false} />
}
