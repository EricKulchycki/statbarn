import { cn } from '@heroui/react'

interface AccuracyBadgeProps {
  percentage: number
  compact?: boolean
  className?: string
}

export function AccuracyBadge({
  percentage,
  compact = false,
  className,
}: AccuracyBadgeProps) {
  const colorClass =
    percentage < 50
      ? 'text-red-400'
      : percentage < 55
        ? 'text-amber-400'
        : 'text-emerald-400'

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1',
          className
        )}
      >
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          Acc
        </span>
        <span className={cn('text-xs font-bold tabular-nums', colorClass)}>
          {percentage.toFixed(1)}%
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1.5',
        className
      )}
    >
      <span className="text-xs text-slate-400">Season accuracy</span>
      <span className={cn('text-sm font-bold tabular-nums', colorClass)}>
        {percentage.toFixed(1)}%
      </span>
    </div>
  )
}
