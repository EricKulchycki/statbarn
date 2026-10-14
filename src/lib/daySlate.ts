import { getTimezoneFromCookie } from '@/lib/time'
import { getYesterdayInZone } from '@/lib/yesterdayGames'
import { predictionsService } from '@/services/predictions.service'
import { scheduleService } from '@/services/schedule.service'
import { DateTime } from 'luxon'
import { cache } from 'react'
import { buildDaySlates, DaySlates } from './daySlateModel'

export * from './daySlateModel'

// Deduped per request so the nav bar and the day list share one fetch
export const getDaySlates = cache(async (): Promise<DaySlates> => {
  const timezone = await getTimezoneFromCookie()
  const yesterday = getYesterdayInZone(timezone, DateTime.now())
  const todayIso = yesterday.plus({ days: 1 }).toISODate()!

  // The schedule endpoint returns a week starting at the given date
  const schedule = await scheduleService.getScheduleByDate(
    yesterday.toISODate()!
  )
  const predictions =
    await predictionsService.getUpcomingGamePredictions(schedule)

  const predictionsById = new Map(predictions.map((p) => [p.gameId, p]))
  const gamesById = new Map(
    schedule.gameWeek.flatMap((day) => day.games).map((g) => [g.id, g])
  )

  return {
    slates: buildDaySlates(schedule.gameWeek, predictionsById, todayIso),
    todayIso,
    gamesById,
    predictionsById,
  }
})
