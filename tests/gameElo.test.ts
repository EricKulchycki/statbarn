import { describe, it, expect } from 'vitest'
import { GameELODocument, toGameELO } from '../src/models/gameElo'

const mockGameELODocument = {
  gameId: 1,
  season: 2025,
  gameDate: new Date('2025-09-20T00:00:00Z'),
  homeTeam: {
    abbrev: 'WPG',
    eloBefore: 1500,
    eloAfter: 1510,
    score: 3,
  },
  awayTeam: {
    abbrev: 'TOR',
    eloBefore: 1500,
    eloAfter: 1490,
    score: 2,
  },
  eloChange: {
    homeTeam: 10,
    awayTeam: -10,
  },
  kFactor: 20,
  homeAdvantage: 35,
  expectedResult: {
    homeTeam: 0.6,
    awayTeam: 0.4,
  },
  actualResult: {
    homeTeam: 1,
    awayTeam: 0,
  },
  modelVersion: 'v1',
}

describe('toGameELO', () => {
  it('should convert a GameELODocument to GameELO domain type', () => {
    const result = toGameELO(mockGameELODocument as GameELODocument)
    expect(result).toMatchObject({
      gameId: 1,
      season: 2025,
      homeTeam: { abbrev: 'WPG', score: 3 },
      awayTeam: { abbrev: 'TOR', score: 2 },
      modelVersion: 'v1',
    })
  })
})
