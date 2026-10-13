import { describe, expect, it } from 'vitest'
import {
  backToBackEloAdjustment,
  markBackToBacks,
  summarizeBackToBacks,
} from '../src/lib/backToBack'
import { TeamSeasonGame } from '../src/types/team'

function game(
  scheduleDate: string,
  opts: {
    won?: boolean
    winProbability?: number
    baseWinProbability?: number
  } = {}
): TeamSeasonGame {
  return {
    gameId: Number(scheduleDate.replaceAll('-', '')),
    gameDate: new Date(`${scheduleDate}T23:00:00Z`),
    scheduleDate,
    opponent: 'OPP',
    isHome: true,
    eloBefore: 1500,
    prediction:
      opts.winProbability === undefined
        ? undefined
        : {
            winProbability: opts.winProbability,
            baseWinProbability: opts.baseWinProbability,
            predictedWin: opts.winProbability >= 0.5,
            modelVersion: 'v1',
          },
    outcome:
      opts.won === undefined
        ? undefined
        : {
            actualWin: opts.won,
            eloAfter: 1500,
            eloChange: 0,
            score: { team: opts.won ? 3 : 1, opponent: opts.won ? 1 : 3 },
          },
  }
}

const flags = (games: TeamSeasonGame[]) =>
  markBackToBacks(games).map((g) => [g.scheduleDate, g.isBackToBack])

describe('markBackToBacks', () => {
  it('flags only the second night of consecutive days', () => {
    expect(
      flags([game('2025-10-10'), game('2025-10-11'), game('2025-10-13')])
    ).toEqual([
      ['2025-10-10', false],
      ['2025-10-11', true],
      ['2025-10-13', false],
    ])
  })

  it('does not flag a two-day gap', () => {
    expect(flags([game('2025-10-10'), game('2025-10-12')])).toEqual([
      ['2025-10-10', false],
      ['2025-10-12', false],
    ])
  })

  it('handles unsorted input', () => {
    expect(flags([game('2025-10-11'), game('2025-10-10')])).toEqual([
      ['2025-10-10', false],
      ['2025-10-11', true],
    ])
  })

  it('crosses month and year boundaries', () => {
    expect(
      flags([
        game('2025-10-31'),
        game('2025-11-01'),
        game('2025-12-31'),
        game('2026-01-01'),
      ])
    ).toEqual([
      ['2025-10-31', false],
      ['2025-11-01', true],
      ['2025-12-31', false],
      ['2026-01-01', true],
    ])
  })

  it('does not link the end of one season to the start of the next', () => {
    expect(flags([game('2025-04-17'), game('2025-10-07')])).toEqual([
      ['2025-04-17', false],
      ['2025-10-07', false],
    ])
  })

  it('handles the DST change without shifting days', () => {
    expect(flags([game('2025-11-01'), game('2025-11-02')])).toEqual([
      ['2025-11-01', false],
      ['2025-11-02', true],
    ])
  })
})

describe('summarizeBackToBacks', () => {
  it('compares back-to-back wins with expected wins', () => {
    const summary = summarizeBackToBacks([
      game('2025-10-10', { won: true, winProbability: 0.5 }),
      game('2025-10-11', { won: false, winProbability: 0.6 }), // B2B
      game('2025-10-14', { won: true, winProbability: 0.5 }),
      game('2025-10-15', { won: true, winProbability: 0.4 }), // B2B
    ])

    expect(summary.games).toBe(2)
    expect(summary.wins).toBe(1)
    expect(summary.expectedWins).toBeCloseTo(1.0)
    expect(summary.residual).toBeCloseTo(0)
  })

  it('prefers the pre-factor probability when present', () => {
    const summary = summarizeBackToBacks([
      game('2025-10-10', { won: true, winProbability: 0.5 }),
      game('2025-10-11', {
        won: false,
        winProbability: 0.45,
        baseWinProbability: 0.6,
      }),
    ])

    expect(summary.expectedWins).toBeCloseTo(0.6)
    expect(summary.residual).toBeCloseTo(-0.6)
  })

  it('ignores back-to-backs without an outcome or prediction', () => {
    const summary = summarizeBackToBacks([
      game('2025-10-10', { won: true, winProbability: 0.5 }),
      game('2025-10-11', { winProbability: 0.5 }), // not played yet
      game('2025-10-12', { won: true }), // no prediction
    ])

    expect(summary).toEqual({
      games: 0,
      wins: 0,
      expectedWins: 0,
      residual: 0,
    })
  })

  it('still detects a back-to-back after an unplayed first night', () => {
    // The first night counts for rest even though it has no outcome yet
    const summary = summarizeBackToBacks([
      game('2025-10-10'),
      game('2025-10-11', { won: true, winProbability: 0.5 }),
    ])

    expect(summary.games).toBe(1)
    expect(summary.residual).toBeCloseTo(0.5)
  })
})

describe('backToBackEloAdjustment', () => {
  it('is zero when results match expectation', () => {
    expect(backToBackEloAdjustment(0)).toBe(0)
  })

  it('converts a residual into the Elo gap that shifts 50% by that much', () => {
    // 400·log10(0.55/0.45) ≈ 34.9
    expect(backToBackEloAdjustment(0.05)).toBeCloseTo(34.86, 1)
    expect(backToBackEloAdjustment(-0.05)).toBeCloseTo(-34.86, 1)
  })

  it('caps the adjustment', () => {
    expect(backToBackEloAdjustment(0.2)).toBe(50)
    expect(backToBackEloAdjustment(-0.2, 25)).toBe(-25)
  })

  it('stays finite for residuals beyond ±0.5', () => {
    expect(backToBackEloAdjustment(-0.75, Infinity)).toBeLessThan(0)
    expect(Number.isFinite(backToBackEloAdjustment(-0.75, Infinity))).toBe(true)
  })
})
