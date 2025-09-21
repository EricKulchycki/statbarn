import { describe, it, expect } from 'vitest'
import { calculateGameELO } from '../src/lib/eloCalculator'
import { NHLGame } from '../src/types/game'

const mockGame = {
  id: 3,
  homeTeam: { abbrev: 'COL' },
  awayTeam: { abbrev: 'CHI' },
  gameDate: new Date('2025-09-22T00:00:00Z'),
} as unknown as NHLGame

const mockEloMap = {
  COL: 1520,
  CHI: 1480,
}

describe('calculateGameELO', () => {
  it('should calculate expected results and prediction', async () => {
    const result = await calculateGameELO(mockGame, mockEloMap)
    console.log('ELO Calculation Result:', result)
    expect(result).toHaveProperty('prediction')
    expect(result.prediction.homeTeamWinProbability).toBeGreaterThan(0.5)
    expect(result.prediction.predictedWinner).toBe('COL')
  })
})
