import { describe, expect, it } from 'vitest'
import { selectGamesToPredict } from '../src/lib/predictionWindow'
import { NHLGame, NHLGameDay } from '../src/types/game'
import { GameStatus } from '../src/utils/game'

function game(id: number, gameState: GameStatus | 'PRE', gameType = 2) {
  return { id, gameState, gameType } as unknown as NHLGame
}

function day(date: string, games: NHLGame[]): NHLGameDay {
  return { date, games, numberOfGames: games.length } as NHLGameDay
}

const ids = (days: ReturnType<typeof selectGamesToPredict>) =>
  days.map((d) => [d.date, d.games.map((g) => g.id)])

describe('selectGamesToPredict', () => {
  it('covers three calendar days starting from the given date', () => {
    const week = [
      day('2026-10-13', [game(1, 'FUT')]),
      day('2026-10-14', [game(2, 'FUT')]),
      day('2026-10-15', [game(3, 'FUT')]),
      day('2026-10-16', [game(4, 'FUT')]),
    ]
    expect(ids(selectGamesToPredict(week, '2026-10-13'))).toEqual([
      ['2026-10-13', [1]],
      ['2026-10-14', [2]],
      ['2026-10-15', [3]],
    ])
  })

  it('counts days without games toward the window', () => {
    const week = [
      day('2026-10-13', [game(1, 'FUT')]),
      day('2026-10-14', []),
      day('2026-10-15', [game(3, 'FUT')]),
      day('2026-10-16', [game(4, 'FUT')]),
    ]
    expect(ids(selectGamesToPredict(week, '2026-10-13'))).toEqual([
      ['2026-10-13', [1]],
      ['2026-10-15', [3]],
    ])
  })

  it('ignores days before the start date and unsorted input', () => {
    const week = [
      day('2026-10-14', [game(2, 'FUT')]),
      day('2026-10-12', [game(0, 'FUT')]),
      day('2026-10-13', [game(1, 'FUT')]),
    ]
    expect(ids(selectGamesToPredict(week, '2026-10-13', 2))).toEqual([
      ['2026-10-13', [1]],
      ['2026-10-14', [2]],
    ])
  })

  it('never re-predicts a game that has started or finished', () => {
    const week = [
      day('2026-10-13', [
        game(1, 'FUT'),
        game(2, 'PRE'),
        game(3, 'LIVE'),
        game(4, 'CRIT'),
        game(5, 'FINAL'),
        game(6, 'OFF'),
      ]),
    ]
    expect(ids(selectGamesToPredict(week, '2026-10-13'))).toEqual([
      ['2026-10-13', [1, 2]],
    ])
  })

  it('skips preseason and playoff games', () => {
    const week = [
      day('2026-10-13', [
        game(1, 'FUT', 1),
        game(2, 'FUT', 2),
        game(3, 'FUT', 3),
      ]),
    ]
    expect(ids(selectGamesToPredict(week, '2026-10-13'))).toEqual([
      ['2026-10-13', [2]],
    ])
  })
})
