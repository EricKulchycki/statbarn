import mongoose, { Schema, Document, Model } from 'mongoose'

export interface GoalieStatsDocument extends Document {
  playerId: number
  season: number
  gamesPlayed: number
  gamesStarted: number
  wins: number
  losses: number
  otLosses: number
  shotsAgainst: number
  saves: number
  goalsAgainst: number
  savePctg: number
  goalsAgainstAvg: number
  shutouts: number
  timeOnIce: string
}

const goalieStatsSchema: Schema = new Schema(
  {
    playerId: { type: Number, required: true },
    season: { type: Number, required: true },
    gamesPlayed: { type: Number, required: true, default: 0 },
    gamesStarted: { type: Number, required: true, default: 0 },
    wins: { type: Number, required: true, default: 0 },
    losses: { type: Number, required: true, default: 0 },
    otLosses: { type: Number, required: true, default: 0 },
    shotsAgainst: { type: Number, required: true, default: 0 },
    saves: { type: Number, required: true, default: 0 },
    goalsAgainst: { type: Number, required: true, default: 0 },
    savePctg: { type: Number, required: true, default: 0 },
    goalsAgainstAvg: { type: Number, required: true, default: 0 },
    shutouts: { type: Number, required: true, default: 0 },
    timeOnIce: { type: String, required: true, default: '0:00' },
  },
  {
    timestamps: true,
    collection: 'goalieStats',
  }
)

goalieStatsSchema.index({ playerId: 1, season: 1 }, { unique: true })
goalieStatsSchema.index({ season: 1 })
goalieStatsSchema.index({ savePctg: -1 })
goalieStatsSchema.index({ wins: -1 })

export const GoalieStatsModel: Model<GoalieStatsDocument> =
  mongoose.models.GoalieStats ||
  mongoose.model<GoalieStatsDocument>('GoalieStats', goalieStatsSchema)
