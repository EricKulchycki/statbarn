import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MODEL_PARAMS,
  type ModelParams,
} from '@statbarn/prediction-core'
import {
  backtestModel,
  calibrationBuckets,
  ReplayGame,
} from '../src/lib/modelBacktest'

const params: ModelParams = {
  ...DEFAULT_MODEL_PARAMS,
  kFactor: 20,
  homeAdvantage: 0,
  marginOfVictory: { ...DEFAULT_MODEL_PARAMS.marginOfVictory, enabled: false },
  matchupMaxAdjustment: 0,
}

function game(
  season: number,
  day: number,
  home: string,
  away: string,
  homeWon: boolean
): ReplayGame {
  return {
    season,
    gameDate: new Date(Date.UTC(2025, 9, day)),
    home,
    away,
    homeScore: homeWon ? 3 : 1,
    awayScore: homeWon ? 1 : 3,
  }
}

const noSplit = { holdoutSeason: null, currentSeason: null }

describe('backtestModel', () => {
  it('predicts each game from ratings before that game', () => {
    const { forecasts } = backtestModel(
      [game(1, 1, 'AAA', 'BBB', true), game(1, 2, 'AAA', 'BBB', true)],
      params,
      noSplit
    )

    // Even ratings and no home advantage: a coin flip
    expect(forecasts[0].probability).toBeCloseTo(0.5)
    // AAA gained K·0.5 = 10 Elo, BBB lost 10, so AAA is now favoured
    expect(forecasts[1].probability).toBeCloseTo(1 / (1 + 10 ** (-20 / 400)))
  })

  it('replays games in date order regardless of input order', () => {
    const ordered = backtestModel(
      [game(1, 1, 'AAA', 'BBB', true), game(1, 2, 'AAA', 'BBB', false)],
      params,
      noSplit
    )
    const shuffled = backtestModel(
      [game(1, 2, 'AAA', 'BBB', false), game(1, 1, 'AAA', 'BBB', true)],
      params,
      noSplit
    )
    expect(shuffled.forecasts).toEqual(ordered.forecasts)
  })

  it('applies home advantage from params', () => {
    const { forecasts } = backtestModel(
      [game(1, 1, 'AAA', 'BBB', true)],
      { ...params, homeAdvantage: 100 },
      noSplit
    )
    expect(forecasts[0].probability).toBeCloseTo(1 / (1 + 10 ** (-100 / 400)))
  })

  it('regresses ratings between seasons', () => {
    const fullReset = { ...params, meanRegressionFactor: 1 }
    const { forecasts } = backtestModel(
      [game(1, 1, 'AAA', 'BBB', true), game(2, 2, 'AAA', 'BBB', true)],
      fullReset,
      noSplit
    )
    // Regressing all the way back to the mean makes the new season even again
    expect(forecasts[1].probability).toBeCloseTo(0.5)
  })

  it('reports train, holdout and in-progress seasons separately', () => {
    const { backtest } = backtestModel(
      [
        game(1, 1, 'AAA', 'BBB', true),
        game(2, 2, 'AAA', 'BBB', true),
        game(3, 3, 'AAA', 'BBB', true),
      ],
      params,
      { holdoutSeason: 2, currentSeason: 3 }
    )

    expect(backtest.trainSeasons).toEqual([1])
    expect(backtest.trainBrier).toBeCloseTo(0.25)
    expect(backtest.holdoutSeason).toBe(2)
    expect(backtest.holdoutBrier).not.toBeNull()
    expect(backtest.seasons.map((s) => s.season)).toEqual([1, 2, 3])
  })

  it('leaves the holdout empty when that season has no games', () => {
    const { backtest } = backtestModel(
      [game(1, 1, 'AAA', 'BBB', true)],
      params,
      { holdoutSeason: 9, currentSeason: null }
    )
    expect(backtest.holdoutSeason).toBeNull()
    expect(backtest.holdoutBrier).toBeNull()
  })

  it('uses the head-to-head record when updating Elo', () => {
    const withMatchup = { ...params, matchupMaxAdjustment: 50 }
    const games = [
      game(1, 1, 'AAA', 'BBB', true),
      game(1, 2, 'AAA', 'BBB', true),
      game(1, 3, 'AAA', 'BBB', true),
    ]
    const plain = backtestModel(games, params, noSplit).forecasts
    const adjusted = backtestModel(games, withMatchup, noSplit).forecasts

    // AAA's sweep raises its expected score, so it gains less from winning
    expect(adjusted[2].probability).toBeLessThan(plain[2].probability)
  })
})

describe('calibrationBuckets', () => {
  it("measures favourites from either side's perspective", () => {
    const buckets = calibrationBuckets([
      { probability: 0.72, occurred: true }, // home favourite won
      { probability: 0.28, occurred: true }, // away favourite lost
    ])

    expect(buckets).toEqual([
      { range: [0.7, 0.8], games: 2, predicted: 0.72, actual: 0.5 },
    ])
  })
})
