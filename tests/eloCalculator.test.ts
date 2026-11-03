import { DEFAULT_MODEL_PARAMS } from '@statbarn/prediction-core'
import { describe, expect, it, vi } from 'vitest'
import { getMatchupHistoryForTeam } from '../src/data/teams'
import {
  calculateGameELO,
  getLast5MatchupFactor,
} from '../src/lib/eloCalculator'
import { NHLGame } from '../src/types/game'
import { TeamSeasonGame } from '../src/types/team'

vi.mock('@/data/teams', () => {
  const mockGames: Partial<TeamSeasonGame>[] = [
    {
      opponent: 'CHI',
      isHome: true,
      outcome: {
        actualWin: true,
        eloAfter: 1530,
        eloChange: 10,
        score: { team: 3, opponent: 2 },
      },
    },
    {
      opponent: 'CHI',
      isHome: true,
      outcome: {
        actualWin: false,
        eloAfter: 1510,
        eloChange: -10,
        score: { team: 2, opponent: 4 },
      },
    },
    {
      opponent: 'CHI',
      isHome: true,
      outcome: {
        actualWin: true,
        eloAfter: 1540,
        eloChange: 10,
        score: { team: 4, opponent: 1 },
      },
    },
    {
      opponent: 'CHI',
      isHome: false,
      outcome: {
        actualWin: true,
        eloAfter: 1550,
        eloChange: 10,
        score: { team: 3, opponent: 2 },
      },
    },
    {
      opponent: 'CHI',
      isHome: true,
      outcome: {
        actualWin: true,
        eloAfter: 1560,
        eloChange: 10,
        score: { team: 2, opponent: 1 },
      },
    },
  ]
  return {
    getMatchupHistoryForTeam: vi.fn().mockResolvedValue(mockGames),
  }
})

const mockGame = {
  id: 3,
  homeTeam: { abbrev: 'COL', score: 3 },
  awayTeam: { abbrev: 'CHI', score: 2 },
  gameDate: new Date('2025-09-22T00:00:00Z'),
  startTimeUTC: '2025-09-22T00:00:00Z',
  season: 20252026,
} as unknown as NHLGame

const mockEloMap = {
  COL: 1520,
  CHI: 1480,
}

describe('calculateGameELO', () => {
  it('should return homeTeam and awayTeam with updated ELOs', async () => {
    const result = await calculateGameELO(mockGame, mockEloMap)
    expect(result).toHaveProperty('homeTeam')
    expect(result).toHaveProperty('awayTeam')
    expect(result.homeTeam.eloBefore).toBe(1520)
    expect(result.awayTeam.eloBefore).toBe(1480)
    expect(result.homeTeam.eloAfter).toBeGreaterThan(1520)
    expect(result.awayTeam.eloAfter).toBeLessThan(1480)
  })

  describe('matchup factor adjustments', () => {
    it('should adjust ELOs based on last 5 matchups', async () => {
      const matchupFactor = await getLast5MatchupFactor(mockGame, 8)
      // With COL winning 4/5 from home perspective, homeFactor should exceed awayFactor
      expect(matchupFactor.homeFactor).toBeGreaterThan(matchupFactor.awayFactor)
      expect(matchupFactor.homeFactor).toBeLessThanOrEqual(15)
      expect(matchupFactor.awayFactor).toBeGreaterThanOrEqual(0)
    })

    it('skips the history query when the adjustment is off', async () => {
      vi.mocked(getMatchupHistoryForTeam).mockClear()
      const params = { ...DEFAULT_MODEL_PARAMS, matchupMaxAdjustment: 0 }

      const result = await calculateGameELO(mockGame, mockEloMap, params)

      expect(getMatchupHistoryForTeam).not.toHaveBeenCalled()
      expect(result.homeTeam.eloAfter).toBeGreaterThan(1520)
    })
  })
})
