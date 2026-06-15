import { getCachedAccuracyStats } from '@/lib/cache'
import { getCurrentNHLSeason } from '@/utils/currentSeason'
import { AccuracyBadge } from './AccuracyBadge'

interface Props {
  compact?: boolean
  className?: string
}

export async function SeasonAccuracyChip({ compact, className }: Props) {
  const currentSeason = Number(getCurrentNHLSeason())
  let stats = await getCachedAccuracyStats(currentSeason)

  if (stats.totalGames === 0) {
    const startYear = Math.floor(currentSeason / 10000)
    const prevSeason = (startYear - 1) * 10000 + startYear
    stats = await getCachedAccuracyStats(prevSeason)
  }

  return (
    <AccuracyBadge
      percentage={stats.percentage}
      compact={compact}
      className={className}
    />
  )
}
