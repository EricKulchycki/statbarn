'use client'

import { GameELO } from '@/models/gameElo'
import { Team } from '@/types/team'
import { GameScheduleTable } from '@/components/GameScheduleTable'
import { toScheduleRowFromGameElo } from '@/utils/gameSchedule'

interface Props {
  gameElos: GameELO[]
  teams: Team[]
}

export function YesterdaysGameOutcomes({ gameElos, teams }: Props) {
  const rows = gameElos.map(toScheduleRowFromGameElo)

  return <GameScheduleTable rows={rows} teams={teams} interactive={false} />
}
