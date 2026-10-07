import { describe, expect, it, vi } from 'vitest'
import {
  buildDaySlates,
  resolveSelectedDate,
  summarizeDay,
  tallyRecord,
  toSlateGame,
} from '../src/lib/daySlate'
import {
  makeDay,
  makeGame,
  makeHomeFavoredPrediction,
  TODAY,
} from './fixtures/slate'

vi.mock('@/lib/time', () => ({ getTimezoneFromCookie: vi.fn() }))
vi.mock('@/services/elo.service', () => ({ eloService: {} }))
vi.mock('@/services/predictions.service', () => ({ predictionsService: {} }))
vi.mock('@/services/schedule.service', () => ({ scheduleService: {} }))

describe('toSlateGame', () => {
  it('marks a won final as correct and carries pick probability', () => {
    const g = toSlateGame(
      makeGame(1, 'OFF', 3, 1),
      makeHomeFavoredPrediction(1)
    )
    expect(g.state).toBe('final')
    expect(g.pick).toBe('WPG')
    expect(g.pickProbability).toBe(0.6)
    expect(g.pickStatus).toBe('correct')
    expect(g.home.score).toBe(3)
  })

  it('marks a lost final as incorrect', () => {
    expect(
      toSlateGame(makeGame(1, 'FINAL', 1, 2), makeHomeFavoredPrediction(1))
        .pickStatus
    ).toBe('incorrect')
  })

  it('labels overtime and shootout finals', () => {
    expect(toSlateGame(makeGame(1, 'OFF', 3, 2, 'OT')).finalLabel).toBe(
      'FINAL/OT'
    )
    expect(toSlateGame(makeGame(1, 'OFF', 3, 2, 'SO')).finalLabel).toBe(
      'FINAL/SO'
    )
    expect(toSlateGame(makeGame(1, 'OFF', 3, 2)).finalLabel).toBe('FINAL')
  })

  it('tracks live games as leading, trailing, or level', () => {
    expect(
      toSlateGame(makeGame(1, 'LIVE', 2, 1), makeHomeFavoredPrediction(1))
        .pickStatus
    ).toBe('leading')
    expect(
      toSlateGame(makeGame(1, 'CRIT', 1, 2), makeHomeFavoredPrediction(1))
        .pickStatus
    ).toBe('trailing')
    expect(
      toSlateGame(makeGame(1, 'LIVE', 1, 1), makeHomeFavoredPrediction(1))
        .pickStatus
    ).toBe('level')
  })

  it('hides scores and status for upcoming games', () => {
    const g = toSlateGame(makeGame(1, 'FUT'), makeHomeFavoredPrediction(1))
    expect(g.state).toBe('upcoming')
    expect(g.home.score).toBeNull()
    expect(g.pickStatus).toBeNull()
  })

  it('has no pick when there is no prediction', () => {
    const g = toSlateGame(makeGame(1, 'OFF', 3, 1))
    expect(g.pick).toBeNull()
    expect(g.pickProbability).toBeNull()
    expect(g.pickStatus).toBeNull()
    expect(g.home.winProbability).toBeNull()
  })
})

describe('summarizeDay', () => {
  const won = toSlateGame(
    makeGame(1, 'OFF', 3, 1),
    makeHomeFavoredPrediction(1)
  )
  const lost = toSlateGame(
    makeGame(2, 'OFF', 1, 3),
    makeHomeFavoredPrediction(2)
  )
  const live = toSlateGame(
    makeGame(3, 'LIVE', 2, 0),
    makeHomeFavoredPrediction(3)
  )
  const later = toSlateGame(makeGame(4, 'FUT'), makeHomeFavoredPrediction(4))
  const unpicked = toSlateGame(makeGame(5, 'OFF', 1, 3))

  it('reports correct picks when every game is final', () => {
    expect(summarizeDay([won, won, won, lost], '2026-10-05', TODAY)).toBe(
      '3/4 correct'
    )
  })

  it('excludes unpicked games from the graded total', () => {
    expect(summarizeDay([won, lost, unpicked], '2026-10-05', TODAY)).toBe(
      '1/2 correct'
    )
  })

  it('reports a running record that ignores live games', () => {
    expect(summarizeDay([won, won, lost, live, later], TODAY, TODAY)).toBe(
      '5 games · 2–1 so far'
    )
  })

  it('reports the game count before any game finishes', () => {
    expect(summarizeDay([later], TODAY, TODAY)).toBe('1 game')
  })

  it('reports upcoming for future games without predictions', () => {
    const g = toSlateGame(makeGame(6, 'FUT'))
    expect(summarizeDay([g], '2026-10-08', TODAY)).toBe('Upcoming')
  })

  it('reports missing predictions for past games', () => {
    expect(summarizeDay([unpicked], '2026-10-05', TODAY)).toBe('No predictions')
  })

  it('reports no games for an empty schedule day', () => {
    expect(summarizeDay([], '2026-10-07', TODAY)).toBe('No games')
  })
})

describe('tallyRecord', () => {
  it('counts each pick status', () => {
    const games = [
      toSlateGame(makeGame(1, 'OFF', 3, 1), makeHomeFavoredPrediction(1)),
      toSlateGame(makeGame(2, 'LIVE', 0, 1), makeHomeFavoredPrediction(2)),
      toSlateGame(makeGame(3, 'LIVE', 0, 2), makeHomeFavoredPrediction(3)),
      toSlateGame(makeGame(4, 'LIVE', 1, 1), makeHomeFavoredPrediction(4)),
    ]
    expect(tallyRecord(games)).toEqual({
      correct: 1,
      incorrect: 0,
      leading: 0,
      trailing: 2,
      level: 1,
    })
  })
})

describe('buildDaySlates', () => {
  const gameDays = [
    makeDay('2026-10-05', [makeGame(1, 'OFF', 3, 1), makeGame(2, 'OFF', 1, 2)]),
    makeDay(TODAY, [makeGame(3, 'FINAL', 4, 2), makeGame(4, 'FUT')]),
    makeDay('2026-10-07', [makeGame(5, 'FUT')]),
    makeDay('2026-10-08', [makeGame(6, 'FUT')]),
    makeDay('2026-10-09', [makeGame(7, 'FUT')]),
  ]
  const predictionsById = new Map(
    [1, 2, 3, 4, 5].map((id) => [id, makeHomeFavoredPrediction(id)])
  )
  const slates = buildDaySlates(gameDays, predictionsById, TODAY)

  it('keeps only the first four days', () => {
    expect(slates.map((s) => s.date)).toEqual([
      '2026-10-05',
      TODAY,
      '2026-10-07',
      '2026-10-08',
    ])
  })

  it('formats tab labels and headings', () => {
    expect(slates[1].label).toBe('TUE OCT 6')
    expect(slates[1].heading).toBe('TUE, OCT 6 · 2 GAMES')
  })

  it('counts every scheduled game, including unpredicted ones', () => {
    expect(slates[3].heading).toBe('THU, OCT 8 · 1 GAME')
    expect(slates[3].games).toHaveLength(1)
  })

  it('titles past, current, and future days', () => {
    expect(slates.map((s) => s.title)).toEqual([
      'Results',
      "Tonight's slate",
      'Upcoming slate',
      'Upcoming slate',
    ])
    expect(slates.map((s) => s.isToday)).toEqual([false, true, false, false])
  })

  it('summarizes each day', () => {
    expect(slates.map((s) => s.summary)).toEqual([
      '1/2 correct',
      '2 games · 1–0 so far',
      '1 game',
      'Upcoming',
    ])
  })
})

describe('resolveSelectedDate', () => {
  const slates = buildDaySlates(
    [makeDay('2026-10-05', []), makeDay(TODAY, [])],
    new Map(),
    TODAY
  )

  it('uses the requested date when it is in the window', () => {
    expect(resolveSelectedDate('2026-10-05', slates, TODAY)).toBe('2026-10-05')
  })

  it('falls back to today for a missing or out-of-window date', () => {
    expect(resolveSelectedDate(undefined, slates, TODAY)).toBe(TODAY)
    expect(resolveSelectedDate('2020-01-01', slates, TODAY)).toBe(TODAY)
  })

  it('falls back to the first day when today is not in the window', () => {
    expect(resolveSelectedDate(undefined, slates, '2026-12-25')).toBe(
      '2026-10-05'
    )
  })
})
