import { describe, expect, it } from 'vitest'
import { brierScore } from '../src/utils/brierScore'

describe('brierScore', () => {
  it('returns null when there are no forecasts', () => {
    expect(brierScore([])).toBeNull()
  })

  it('scores coin-flip forecasts at 0.25 regardless of outcome', () => {
    expect(
      brierScore([
        { probability: 0.5, occurred: true },
        { probability: 0.5, occurred: false },
      ])
    ).toBe(0.25)
  })

  it('scores certain, correct forecasts at 0', () => {
    expect(
      brierScore([
        { probability: 1, occurred: true },
        { probability: 0, occurred: false },
      ])
    ).toBe(0)
  })

  it('scores certain, wrong forecasts at 1', () => {
    expect(
      brierScore([
        { probability: 1, occurred: false },
        { probability: 0, occurred: true },
      ])
    ).toBe(1)
  })

  it('penalises a confident miss more than a coin-flip miss', () => {
    const confidentMiss = brierScore([{ probability: 0.9, occurred: false }])
    const coinFlipMiss = brierScore([{ probability: 0.502, occurred: false }])
    expect(confidentMiss).toBeCloseTo(0.81)
    expect(coinFlipMiss).toBeCloseTo(0.252)
  })

  it('averages across forecasts', () => {
    expect(
      brierScore([
        { probability: 0.7, occurred: true }, // 0.09
        { probability: 0.6, occurred: false }, // 0.36
      ])
    ).toBeCloseTo(0.225)
  })
})
