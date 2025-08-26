import mongoose, { Schema, Document, Model } from 'mongoose'

const gameEloSchema: Schema = new Schema(
  {
    gameId: { type: Number, required: true, unique: true },
    season: { type: Number, required: true },
    gameDate: { type: Date, required: true },
    homeTeam: {
      abbrev: { type: String, required: true },
      eloBefore: { type: Number, required: true },
      eloAfter: { type: Number, required: true },
      score: { type: Number, required: true },
    },
    awayTeam: {
      abbrev: { type: String, required: true },
      eloBefore: { type: Number, required: true },
      eloAfter: { type: Number, required: true },
      score: { type: Number, required: true },
    },
    eloChange: {
      homeTeam: { type: Number, required: true },
      awayTeam: { type: Number, required: true },
    },
    kFactor: { type: Number, required: true },
    homeAdvantage: { type: Number, required: true },
    expectedResult: {
      homeTeam: { type: Number, required: true },
      awayTeam: { type: Number, required: true },
    },
    actualResult: {
      homeTeam: { type: Number, required: true },
      awayTeam: { type: Number, required: true },
    },
    modelVersion: { type: String, required: true, default: 'v1' },
  },
  {
    timestamps: true,
    collection: 'gameelo',
  }
)

// Indexes for efficient querying
gameEloSchema.index({ gameId: 1 }, { unique: true })
gameEloSchema.index({ season: 1, gameDate: 1 })
gameEloSchema.index({ 'homeTeam.abbrev': 1, gameDate: 1 })
gameEloSchema.index({ 'awayTeam.abbrev': 1, gameDate: 1 })

export interface GameELODocument extends Document {
  gameId: number
  season: number
  gameDate: Date
  homeTeam: {
    abbrev: string
    eloBefore: number
    eloAfter: number
    score: number
  }
  awayTeam: {
    abbrev: string
    eloBefore: number
    eloAfter: number
    score: number
  }
  eloChange: {
    homeTeam: number
    awayTeam: number
  }
  kFactor: number
  homeAdvantage: number
  expectedResult: {
    homeTeam: number
    awayTeam: number
  }
  actualResult: {
    homeTeam: number
    awayTeam: number
  }
  modelVersion: string
}

export const GameELOModel: Model<GameELODocument> =
  mongoose.models.gameelo ||
  mongoose.model<GameELODocument>('gameelo', gameEloSchema)

export type GameELO = {
  gameId: number
  season: number
  gameDate: Date
  homeTeam: {
    abbrev: string
    eloBefore: number
    eloAfter: number
    score: number
  }
  awayTeam: {
    abbrev: string
    eloBefore: number
    eloAfter: number
    score: number
  }
  eloChange: {
    homeTeam: number
    awayTeam: number
  }
  kFactor: number
  homeAdvantage: number
  expectedResult: {
    homeTeam: number
    awayTeam: number
  }
  actualResult: {
    homeTeam: number
    awayTeam: number
  }
  modelVersion: string
}
