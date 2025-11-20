import mongoose, { Schema, Document, Model } from 'mongoose'

export interface PlayerStatsDocument extends Document {
  playerId: number
  season: number
  gamesPlayed: number
  goals: number
  assists: number
  points: number
  plusMinus: number
  penaltyMinutes: number
  powerPlayGoals: number
  powerPlayPoints: number
  gameWinningGoals: number
  overtimeGoals: number
  shots: number
  shootingPctg: number
  avgTimeOnIcePerGame?: string
}

const playerStatsSchema: Schema = new Schema(
  {
    playerId: { type: Number, required: true },
    season: { type: Number, required: true },
    gamesPlayed: { type: Number, required: true, default: 0 },
    goals: { type: Number, required: true, default: 0 },
    assists: { type: Number, required: true, default: 0 },
    points: { type: Number, required: true, default: 0 },
    plusMinus: { type: Number, required: true, default: 0 },
    penaltyMinutes: { type: Number, required: true, default: 0 },
    powerPlayGoals: { type: Number, required: true, default: 0 },
    powerPlayPoints: { type: Number, required: true, default: 0 },
    gameWinningGoals: { type: Number, required: true, default: 0 },
    overtimeGoals: { type: Number, required: true, default: 0 },
    shots: { type: Number, required: true, default: 0 },
    shootingPctg: { type: Number, required: true, default: 0 },
    avgTimeOnIcePerGame: { type: String },
  },
  {
    timestamps: true,
    collection: 'playerStats',
  }
)

playerStatsSchema.index({ playerId: 1, season: 1 }, { unique: true })
playerStatsSchema.index({ season: 1 })
playerStatsSchema.index({ points: -1 })
playerStatsSchema.index({ goals: -1 })

export const PlayerStatsModel: Model<PlayerStatsDocument> =
  mongoose.models.PlayerStats ||
  mongoose.model<PlayerStatsDocument>('PlayerStats', playerStatsSchema)
