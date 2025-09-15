import { Conference, Division } from '@/types/team'
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface TeamDocument extends Document {
  id: number
  franchiseId: number
  fullName: string
  leagueId: number
  rawTricode: string
  triCode: string
  conference: Conference
  division: Division
  logo?: string
}

const teamSchema: Schema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    franchiseId: { type: Number, required: true },
    fullName: { type: String, required: true },
    leagueId: { type: Number, required: true },
    rawTricode: { type: String, required: true },
    triCode: { type: String, required: true },
    conference: {
      type: String,
      enum: Object.values(Conference),
      required: true,
    },
    division: {
      type: String,
      enum: Object.values(Division),
      required: true,
    },
    logo: { type: String },
  },
  {
    timestamps: true,
    collection: 'teams',
  }
)

export const TeamModel: Model<TeamDocument> =
  mongoose.models.Team || mongoose.model<TeamDocument>('Team', teamSchema)
