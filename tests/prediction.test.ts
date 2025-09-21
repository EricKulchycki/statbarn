import { describe, it, expect } from 'vitest'
import {
  toPredictionDomain,
  serializePrediction,
  deserializePrediction,
} from '../src/utils/converters/prediction'
import { PredictionDocument } from '../src/models/prediction'

const mockPredictionDocument = {
  gameId: 2,
  homeTeam: 'NYR',
  awayTeam: 'BOS',
  homeTeamWinProbability: 0.55,
  awayTeamWinProbability: 0.45,
  predictedWinner: 'NYR',
  gameDate: new Date('2025-09-21T00:00:00Z'),
  modelVersion: 'v1',
  result: {
    homeTeamScore: 4,
    awayTeamScore: 2,
    winner: 'NYR',
    correctPrediction: true,
  },
}

describe('Prediction converters', () => {
  it('should convert PredictionDocument to domain Prediction', () => {
    const result = toPredictionDomain(
      mockPredictionDocument as PredictionDocument
    )
    expect(result).toMatchObject({
      gameId: 2,
      homeTeam: 'NYR',
      predictedWinner: 'NYR',
      result: { correctPrediction: true },
    })
  })

  it('should serialize and deserialize Prediction', () => {
    const serialized = serializePrediction(mockPredictionDocument)
    expect(typeof serialized.gameDate).toBe('string')
    const deserialized = deserializePrediction(serialized)
    expect(deserialized.gameDate instanceof Date).toBe(true)
  })
})
