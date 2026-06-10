import { unstable_cache } from 'next/cache'
import { playerService } from '@/services/player.service'
import { PlayerStats } from './PlayerStats'

const getCachedPlayerStats = unstable_cache(
  async () => {
    const [topScorers, topGoalies] = await Promise.all([
      playerService.getEnhancedTopScorers(10),
      playerService.getEnhancedTopGoalies(5),
    ])
    return { topScorers, topGoalies }
  },
  ['player-stats'],
  { revalidate: 300, tags: ['player-stats'] }
)

export async function PlayerStatsWrapper() {
  const { topScorers, topGoalies } = await getCachedPlayerStats()
  return <PlayerStats topScorers={topScorers} topGoalies={topGoalies} />
}
