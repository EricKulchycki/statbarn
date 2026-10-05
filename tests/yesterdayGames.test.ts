import { DateTime } from 'luxon'
import { describe, expect, it, vi } from 'vitest'
import { getYesterdayInZone } from '../src/lib/yesterdayGames'

vi.mock('@/lib/time', () => ({ getTimezoneFromCookie: vi.fn() }))
vi.mock('@/services/elo.service', () => ({ eloService: {} }))

describe('getYesterdayInZone', () => {
  // 9pm Oct 4 in Winnipeg (CDT, UTC-5) is already Oct 5 in UTC
  const now = DateTime.fromISO('2026-10-05T02:00:00Z', { zone: 'utc' })

  it('uses the user timezone calendar day', () => {
    expect(getYesterdayInZone('America/Winnipeg', now).toISODate()).toBe(
      '2026-10-03'
    )
  })

  it('differs from the UTC calendar day across midnight UTC', () => {
    expect(getYesterdayInZone('UTC', now).toISODate()).toBe('2026-10-04')
  })

  it('falls back to the given instant zone for an invalid timezone', () => {
    expect(getYesterdayInZone('Not/AZone', now).toISODate()).toBe('2026-10-04')
  })
})
