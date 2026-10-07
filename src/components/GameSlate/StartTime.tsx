import { useIsHydrated } from '@/hooks/useIsHydrated'

export function StartTime({ startTimeUTC }: { startTimeUTC: string }) {
  const isHydrated = useIsHydrated()

  // Local time is only known in the browser
  if (!isHydrated) {
    return <span className="text-sm font-semibold text-slate-500">—</span>
  }

  return (
    <time
      dateTime={startTimeUTC}
      className="text-sm font-semibold text-slate-300"
    >
      {new Date(startTimeUTC).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })}
    </time>
  )
}
