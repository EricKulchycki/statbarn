import { describe, expect, it } from 'vitest'
import { applyLiveGames, buildDaySlates } from '../src/lib/daySlateModel'
import {
  applyLiveGame,
  LIVE_POLL_MS,
  LiveGame,
  liveSchedule,
  toLiveGame,
  WatchedGame,
} from '../src/lib/liveGames'
import { GameStatus } from '../src/utils/game'
import {
  makeDay,
  makeGame,
  makeHomeFavoredPrediction,
  TODAY,
} from './fixtures/slate'

const NOW = Date.parse('2026-10-13T23:30:00Z')
const MINUTE = 60_000

function watched(
  id: number,
  gameState: GameStatus,
  startOffsetMinutes: number
): WatchedGame {
  return {
    id,
    gameState,
    startTimeUTC: new Date(NOW + startOffsetMinutes * MINUTE).toISOString(),
  }
}

describe('liveSchedule', () => {
  it('polls while any game is live', () => {
    expect(
      liveSchedule([watched(1, 'FINAL', -180), watched(2, 'LIVE', -30)], NOW)
    ).toEqual({ mode: 'live' })
  })

  it('polls once a start time has passed, before the feed says LIVE', () => {
    expect(liveSchedule([watched(1, 'FUT', -2)], NOW)).toEqual({
      mode: 'live',
    })
  })

  it('waits until the next start time', () => {
    expect(
      liveSchedule([watched(1, 'FUT', 20), watched(2, 'FUT', 90)], NOW)
    ).toEqual({ mode: 'waiting', ms: 20 * MINUTE })
  })

  it('caps a long wait so the page re-checks occasionally', () => {
    expect(liveSchedule([watched(1, 'FUT', 24 * 60)], NOW)).toEqual({
      mode: 'waiting',
      ms: 30 * MINUTE,
    })
  })

  it('stops once every game is final', () => {
    expect(
      liveSchedule([watched(1, 'OFF', -200), watched(2, 'FINAL', -180)], NOW)
    ).toEqual({ mode: 'idle' })
  })

  it('stops watching a game that never started (postponed)', () => {
    expect(liveSchedule([watched(1, 'FUT', -7 * 60)], NOW)).toEqual({
      mode: 'idle',
    })
  })

  it('polls at the documented interval', () => {
    expect(LIVE_POLL_MS).toBe(30_000)
  })
})

describe('toLiveGame', () => {
  it('keeps only the fields that change during a game', () => {
    expect(
      toLiveGame({
        id: 7,
        gameState: 'LIVE',
        awayTeam: { score: 2 },
        homeTeam: { score: 1 },
        periodDescriptor: { periodType: 'OT' },
      })
    ).toEqual({
      id: 7,
      gameState: 'LIVE',
      awayScore: 2,
      homeScore: 1,
      periodType: 'OT',
    })
  })

  it('treats missing scores as unknown', () => {
    const game = toLiveGame({
      id: 7,
      gameState: 'FUT',
      awayTeam: {},
      homeTeam: {},
    })
    expect(game.awayScore).toBeNull()
    expect(game.homeScore).toBeNull()
    expect(game.periodType).toBeNull()
  })
})

describe('applyLiveGame', () => {
  it('overlays state and scores on a schedule game', () => {
    const game = applyLiveGame(makeGame(1, 'FUT'), {
      id: 1,
      gameState: 'LIVE',
      awayScore: 1,
      homeScore: 3,
      periodType: 'REG',
    })
    expect(game.gameState).toBe('LIVE')
    expect(game.homeTeam.score).toBe(3)
    expect(game.awayTeam.score).toBe(1)
    expect(game.homeTeam.abbrev).toBe('WPG')
  })

  it('leaves a game without an update untouched', () => {
    const game = makeGame(1, 'FUT')
    expect(applyLiveGame(game)).toBe(game)
  })
})

describe('applyLiveGames', () => {
  // WPG (home) is the pick in every game
  const slate = buildDaySlates(
    [makeDay(TODAY, [makeGame(1, 'FUT'), makeGame(2, 'LIVE', 1, 1)])],
    new Map([
      [1, makeHomeFavoredPrediction(1)],
      [2, makeHomeFavoredPrediction(2)],
    ]),
    TODAY
  )[0]

  const update = (
    id: number,
    gameState: GameStatus,
    homeScore: number,
    awayScore: number,
    periodType = 'REG'
  ): [number, LiveGame] => [
    id,
    { id, gameState, homeScore, awayScore, periodType },
  ]

  it('moves a game from upcoming to live with the pick leading', () => {
    const next = applyLiveGames(
      slate,
      new Map([update(1, 'LIVE', 2, 0)]),
      TODAY
    )
    const game = next.games.find((g) => g.id === 1)!

    expect(game.state).toBe('live')
    expect(game.home.score).toBe(2)
    expect(game.pickStatus).toBe('leading')
    expect(next.record.leading).toBe(1)
  })

  it('settles a finished game and updates the record', () => {
    const next = applyLiveGames(
      slate,
      new Map([update(2, 'OFF', 1, 2, 'OT')]),
      TODAY
    )
    const game = next.games.find((g) => g.id === 2)!

    expect(game.state).toBe('final')
    expect(game.finalLabel).toBe('FINAL/OT')
    expect(game.pickStatus).toBe('incorrect')
    expect(next.record.incorrect).toBe(1)
    expect(next.summary).toContain('0–1 so far')
  })

  it('keeps the published pick and probabilities', () => {
    const next = applyLiveGames(
      slate,
      new Map([update(1, 'LIVE', 0, 3)]),
      TODAY
    )
    const before = slate.games.find((g) => g.id === 1)!
    const after = next.games.find((g) => g.id === 1)!

    expect(after.pick).toBe(before.pick)
    expect(after.pickProbability).toBe(before.pickProbability)
    expect(after.pickStatus).toBe('trailing')
  })

  it('returns the same slate when no update matches its games', () => {
    expect(
      applyLiveGames(slate, new Map([update(99, 'LIVE', 1, 0)]), TODAY)
    ).toBe(slate)
  })
})
