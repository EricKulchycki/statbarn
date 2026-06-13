import { Conference, Division, EloReset, TeamSeason } from '@/types/team'
import mongoose, { Document, Model, Schema } from 'mongoose'

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
  currentElo?: number
  eloResets: EloReset[]
  seasons: TeamSeason[]
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
    currentElo: { type: Number },
    eloResets: [
      {
        date: { type: Date, required: true },
        reason: { type: String, required: true },
        fromElo: { type: Number, required: true },
        toElo: { type: Number, required: true },
      },
    ],
    seasons: [
      {
        season: { type: Number, required: true },
        startElo: { type: Number, required: true },
        games: [
          {
            gameId: { type: Number, required: true },
            gameDate: { type: Date, required: true },
            opponent: { type: String, required: true },
            isHome: { type: Boolean, required: true },
            eloBefore: { type: Number, required: true },
            prediction: {
              winProbability: { type: Number },
              predictedWin: { type: Boolean },
              modelVersion: { type: String },
            },
            outcome: {
              actualWin: { type: Boolean },
              eloAfter: { type: Number },
              eloChange: { type: Number },
              score: {
                team: { type: Number },
                opponent: { type: Number },
              },
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    collection: 'teams',
  }
)

export const TeamModel: Model<TeamDocument> =
  mongoose.models.Team || mongoose.model<TeamDocument>('Team', teamSchema)
