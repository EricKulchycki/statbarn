import React from 'react'
import { getTeams } from '@/data/teams'
import { getYesterdayGamesSummary } from '@/lib/yesterdayGames'
import { YesterdaysGameOutcomes as YesterdaysGameOutcomesClient } from './client'
import { CollapsibleSection } from '@/components/CollapsibleSection'

export async function YesterdaysGameOutcomes() {
  const summary = await getYesterdayGamesSummary()

  if (!summary.gameElos || summary.gameElos.length === 0) {
    return null
  }

  const teams = await getTeams()
  const title = `Yesterday (${summary.correctPredictions}/${summary.totalGames} correct)`

  return (
    <CollapsibleSection title={title} defaultOpen={false}>
      <YesterdaysGameOutcomesClient gameElos={summary.gameElos} teams={teams} />
    </CollapsibleSection>
  )
}
