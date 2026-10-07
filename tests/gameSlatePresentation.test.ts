import { describe, expect, it, vi } from 'vitest'
import {
  buildSections,
  buildStatTiles,
  formatPercent,
  getFinalFooter,
  getPickBadge,
  getTeamLine,
  getWinProbability,
  isSelectable,
} from '../src/components/GameSlate/presentation'
import { buildDaySlates, toSlateGame } from '../src/lib/daySlate'
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

const predicted = (id: number, ...args: Parameters<typeof makeGame>) =>
  toSlateGame(makeGame(...args), makeHomeFavoredPrediction(id))

function slateFor(date: string, ...games: Parameters<typeof makeGame>[]) {
  const nhlGames = games.map((args) => makeGame(...args))
  const predictions = new Map(
    nhlGames.map((g) => [g.id, makeHomeFavoredPrediction(g.id)])
  )
  return buildDaySlates([makeDay(date, nhlGames)], predictions, TODAY)[0]
}

describe('formatPercent', () => {
  it('rounds to a whole percent', () => {
    expect(formatPercent(0.526)).toBe('53%')
  })
})

describe('buildSections', () => {
  it('orders live, upcoming, then final and drops empty sections', () => {
    const slate = slateFor(
      TODAY,
      [1, 'OFF', 3, 1],
      [2, 'LIVE', 1, 0],
      [3, 'FUT']
    )
    expect(buildSections(slate).map((s) => [s.title, s.games.length])).toEqual([
      ['Live now', 1],
      ['Later tonight', 1],
      ['Final', 1],
    ])
  })

  it('calls upcoming games scheduled on other days', () => {
    const slate = slateFor('2026-10-07', [1, 'FUT'])
    expect(buildSections(slate).map((s) => s.title)).toEqual(['Scheduled'])
  })

  it('only lets the final section collapse', () => {
    const slate = slateFor(TODAY, [1, 'OFF', 3, 1], [2, 'LIVE', 1, 0])
    expect(buildSections(slate).map((s) => [s.key, s.collapsible])).toEqual([
      ['live', false],
      ['final', true],
    ])
  })

  it('returns nothing for a day without games', () => {
    expect(buildSections(slateFor(TODAY))).toEqual([])
  })
})

describe('buildStatTiles', () => {
  it('shows the record and live tallies today', () => {
    const slate = slateFor(
      TODAY,
      [1, 'OFF', 3, 1],
      [2, 'OFF', 1, 3],
      [3, 'LIVE', 0, 1]
    )
    expect(buildStatTiles(slate).map((t) => [t.label, t.value])).toEqual([
      ['Tonight', '1–1'],
      ['Leading', '0'],
      ['Trailing', '1'],
      ['Level', '0'],
    ])
  })

  it('shows only the record on past days', () => {
    const slate = slateFor('2026-10-05', [1, 'OFF', 3, 1])
    expect(buildStatTiles(slate)).toEqual([
      { label: 'Record', value: '1–0', tone: 'neutral', highlighted: true },
    ])
  })

  it('shows nothing on days without graded games', () => {
    expect(buildStatTiles(slateFor('2026-10-07', [1, 'FUT']))).toEqual([])
  })
})

describe('getPickBadge', () => {
  it('shows the pick and probability before puck drop', () => {
    expect(getPickBadge(predicted(1, 1, 'FUT'))).toEqual({
      label: 'Pick WPG · 60%',
      tone: 'neutral',
    })
  })

  it('maps each pick status to a badge', () => {
    expect(getPickBadge(predicted(1, 1, 'LIVE', 2, 1))).toMatchObject({
      label: 'Pick leading',
      tone: 'positive',
      icon: 'up',
    })
    expect(getPickBadge(predicted(1, 1, 'LIVE', 1, 2))).toMatchObject({
      label: 'Pick trailing',
      tone: 'negative',
      icon: 'down',
    })
    expect(getPickBadge(predicted(1, 1, 'OFF', 3, 1))).toMatchObject({
      label: 'Called it',
      icon: 'check',
    })
    expect(getPickBadge(predicted(1, 1, 'OFF', 1, 3))).toMatchObject({
      label: 'Missed',
      icon: 'cross',
    })
  })

  it('reports games without a prediction', () => {
    expect(getPickBadge(toSlateGame(makeGame(1, 'FUT')))).toEqual({
      label: 'No pick',
      tone: 'neutral',
    })
  })
})

describe('getTeamLine', () => {
  it('dims the losing team of a final game', () => {
    const game = predicted(1, 1, 'OFF', 3, 1)
    expect(getTeamLine(game, 'away')).toMatchObject({
      isDimmed: true,
      isScoreMuted: true,
      isPick: false,
      scoreText: '1',
    })
    expect(getTeamLine(game, 'home')).toMatchObject({
      isDimmed: false,
      isScoreMuted: false,
      isPick: true,
      scoreText: '3',
    })
  })

  it('mutes but does not dim a trailing live team', () => {
    expect(getTeamLine(predicted(1, 1, 'LIVE', 1, 2), 'home')).toMatchObject({
      isDimmed: false,
      isScoreMuted: true,
    })
  })

  it('shows a dash before the game starts', () => {
    expect(getTeamLine(predicted(1, 1, 'FUT'), 'home')).toMatchObject({
      isScoreMuted: true,
      scoreText: '–',
    })
  })
})

describe('getFinalFooter', () => {
  it('recalls the pick probability', () => {
    expect(getFinalFooter(predicted(1, 1, 'OFF', 3, 1))).toBe('Had WPG at 60%')
  })

  it('notes when no pick was made', () => {
    expect(getFinalFooter(toSlateGame(makeGame(1, 'OFF', 3, 1)))).toBe(
      'No pick made'
    )
  })
})

describe('getWinProbability', () => {
  it('labels both sides with the away share filling the bar', () => {
    expect(getWinProbability(predicted(1, 1, 'FUT'))).toEqual({
      awayLabel: 'EDM 40%',
      homeLabel: '60% WPG',
      awayPercent: '40%',
      description: 'Win probability: EDM 40%, WPG 60%',
    })
  })

  it('is absent without a prediction', () => {
    expect(getWinProbability(toSlateGame(makeGame(1, 'FUT')))).toBeNull()
  })
})

describe('isSelectable', () => {
  it('only allows predicted games to open the matchup', () => {
    expect(isSelectable(predicted(1, 1, 'FUT'))).toBe(true)
    expect(isSelectable(toSlateGame(makeGame(1, 'FUT')))).toBe(false)
  })
})
