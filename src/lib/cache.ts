import { unstable_cache } from 'next/cache'

/**
 * Cache accuracy stats for 5 minutes
 * This data changes slowly (only when new games finish)
 */
export const getCachedAccuracyStats = unstable_cache(
  async (season: number) => {
    const { eloService } = await import('@/services/elo.service')

    const [totalGames, correctPredictions, brierScore] = await Promise.all([
      eloService.countSeasonsGames(season),
      eloService.countSeasonsCorrectPredictions(season),
      eloService.getSeasonBrierScore(season),
    ])

    return {
      totalGames,
      correctPredictions,
      percentage: totalGames > 0 ? (correctPredictions / totalGames) * 100 : 0,
      brierScore,
    }
  },
  ['accuracy-stats'],
  {
    revalidate: 300, // 5 minutes
    tags: ['accuracy-stats'],
  }
)
