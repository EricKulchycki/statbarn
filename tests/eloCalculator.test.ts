import { describe, it, expect, vi } from 'vitest'
import {
  calculateGameELO,
  getLast5MatchupFactor,
} from '../src/lib/eloCalculator'
import { NHLGame } from '../src/types/game'

vi.mock('@/data/gameElo', () => {
  return {
    getMatchupHistory: vi.fn().mockResolvedValue([
      // Home team (COL) wins 4 out of 5
      {
        homeTeam: { abbrev: 'COL', score: 3 },
        awayTeam: { abbrev: 'CHI', score: 2 },
      },
      {
        homeTeam: { abbrev: 'CHI', score: 4 },
        awayTeam: { abbrev: 'COL', score: 2 },
      },
      {
        homeTeam: { abbrev: 'COL', score: 4 },
        awayTeam: { abbrev: 'CHI', score: 1 },
      },
      {
        homeTeam: { abbrev: 'CHI', score: 2 },
        awayTeam: { abbrev: 'COL', score: 3 },
      },
      {
        homeTeam: { abbrev: 'COL', score: 2 },
        awayTeam: { abbrev: 'CHI', score: 1 },
      },
    ]),
  }
})

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

  describe('matchup factor adjustments', () => {
    it('should adjust ELOs based on last 5 matchups', async () => {
      const matchupFactor = await getLast5MatchupFactor(mockGame)

      console.log('Matchup Factor:', matchupFactor)
      // With COL winning 4/5, the home win probability should be noticeably higher
      expect(matchupFactor.homeFactor).toBeGreaterThan(matchupFactor.awayFactor)
      expect(matchupFactor.homeFactor).toBeLessThanOrEqual(15)
      expect(matchupFactor.awayFactor).toBeGreaterThanOrEqual(-15)
    })
  })
})
