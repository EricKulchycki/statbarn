import { getTimezoneFromCookie } from '@/lib/time'
import { getYesterdayGamesSummary } from '@/lib/yesterdayGames'
import { scheduleService } from '@/services/schedule.service'
import { DateTime } from 'luxon'
import Link from 'next/link'

export async function DashboardHeader() {
  const localTimezone = await getTimezoneFromCookie()
  const localDate = DateTime.now().setZone(localTimezone)
  const dateLabel = localDate.toFormat('EEE, MMM d')

  const [yesterday, schedule] = await Promise.all([
    getYesterdayGamesSummary(),
    scheduleService.getScheduleByDate(localDate.toISODate() ?? ''),
  ])

  const todayIso = localDate.toISODate() ?? ''
  const todaysGameCount = schedule.gameWeek
    .filter((day) => day.date === todayIso)
    .reduce((sum, day) => sum + day.numberOfGames, 0)

  return (
    <header className="mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
        Tonight&apos;s Slate
      </h1>
      <p className="text-gray-400 mt-1">
        {dateLabel}
        {todaysGameCount > 0 && (
          <span className="text-gray-500">
            {' '}
            · {todaysGameCount} game{todaysGameCount !== 1 ? 's' : ''}
          </span>
        )}
      </p>
      {yesterday.totalGames > 0 ? (
        <p className="text-sm text-gray-400 mt-2">
          Yesterday ({yesterday.dateLabel}):{' '}
          <span className="text-slate-200 font-medium">
            {yesterday.correctPredictions}/{yesterday.totalGames} correct
          </span>
          <span className="text-gray-500"> ({yesterday.accuracy}%)</span>
        </p>
      ) : (
        <p className="text-sm text-gray-500 mt-2">No games played yesterday.</p>
      )}
      <p className="text-xs text-gray-500 mt-3">
        Predictions update nightly.{' '}
        <Link
          href="/model-confidence"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          How it works
        </Link>
      </p>
    </header>
  )
}
