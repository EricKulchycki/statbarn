import { CollapsibleSection } from '@/components/CollapsibleSection'
import { getTeams } from '@/data/teams'
import { getYesterdayGamesSummary } from '@/lib/yesterdayGames'
import { YesterdaysGameOutcomes as YesterdaysGameOutcomesClient } from './client'

export async function YesterdaysGameOutcomes() {
  const summary = await getYesterdayGamesSummary()

  if (!summary.games || summary.games.length === 0) {
    return null
  }

  const teams = await getTeams()
  const title = `Yesterday (${summary.correctPredictions}/${summary.totalGames} correct)`

  return (
    <CollapsibleSection title={title} defaultOpen={false}>
      <YesterdaysGameOutcomesClient games={summary.games} teams={teams} />
    </CollapsibleSection>
  )
}
