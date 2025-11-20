import { PlayerPosition } from '@/types/player'
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface PlayerDocument extends Document {
  id: number
  firstName: string
  lastName: string
  fullName: string
  sweaterNumber: number
  positionCode: PlayerPosition
  headshot?: string
  teamId: number
  teamAbbrev: string
}

const playerSchema: Schema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String, required: true },
    sweaterNumber: { type: Number, required: true },
    positionCode: {
      type: String,
      enum: Object.values(PlayerPosition),
      required: true,
    },
    headshot: { type: String },
    teamId: { type: Number, required: true },
    teamAbbrev: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'players',
  }
)

playerSchema.index({ teamId: 1 })
playerSchema.index({ positionCode: 1 })
playerSchema.index({ lastName: 1 })

export const PlayerModel: Model<PlayerDocument> =
  mongoose.models.Player ||
  mongoose.model<PlayerDocument>('Player', playerSchema)
