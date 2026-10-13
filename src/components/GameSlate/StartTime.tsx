import { useIsHydrated } from '@/hooks/useIsHydrated'
import { cn } from '@heroui/react'

interface StartTimeProps {
  startTimeUTC: string
  className?: string
}

export function StartTime({
  startTimeUTC,
  className = 'text-sm font-semibold',
}: StartTimeProps) {
  const isHydrated = useIsHydrated()

  // Local time is only known in the browser
  if (!isHydrated) {
    return <span className={cn(className, 'text-slate-500')}>—</span>
  }

  return (
    <time dateTime={startTimeUTC} className={cn(className, 'text-slate-300')}>
      {new Date(startTimeUTC).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })}
    </time>
  )
}
