import { DateTime } from 'luxon'

export function getYesterdayInZone(timezone: string, now: DateTime): DateTime {
  const local = now.setZone(timezone)
  return (local.isValid ? local : now).minus({ days: 1 })
}
