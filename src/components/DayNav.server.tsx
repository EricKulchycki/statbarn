import { getDaySlates, resolveSelectedDate } from '@/lib/daySlate'
import { cn } from '@heroui/react'
import Link from 'next/link'

interface Props {
  requestedDate?: string
}

export async function DayNav({ requestedDate }: Props) {
  const { slates, todayIso } = await getDaySlates()
  const selected = resolveSelectedDate(requestedDate, slates, todayIso)

  return (
    <nav aria-label="Game days" className="flex overflow-x-auto">
      {slates.map((slate) => {
        const active = slate.date === selected

        return (
          <Link
            key={slate.date}
            href={`/?date=${slate.date}`}
            scroll={false}
            aria-current={active ? 'date' : undefined}
            className={cn(
              'shrink-0 border-b-2 px-4 py-3 transition-colors sm:px-5',
              active
                ? 'border-red-500'
                : 'border-transparent hover:border-slate-700'
            )}
          >
            <span
              className={cn(
                'block text-sm font-bold tracking-wide',
                active ? 'text-white' : 'text-slate-400'
              )}
            >
              {slate.label}
            </span>
            <span className="block whitespace-nowrap text-xs text-slate-400">
              {slate.summary}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

export function DayNavSkeleton() {
  return (
    <div className="flex gap-6 px-4 py-3 sm:px-5">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-16 animate-pulse rounded bg-slate-800" />
        </div>
      ))}
    </div>
  )
}
