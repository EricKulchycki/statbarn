import { playerService } from '@/services/player.service'
import { PlayerStats } from './PlayerStats'

export async function PlayerStatsWrapper() {
  const topScorers = await playerService.getEnhancedTopScorers(10)
  const topGoalies = await playerService.getEnhancedTopGoalies(5)

  return <PlayerStats topScorers={topScorers} topGoalies={topGoalies} />
}
