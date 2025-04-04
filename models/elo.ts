import mongoose, { Schema, Document, Model } from 'mongoose'

const seasonSchema: Schema = new Schema({
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true },
})

const eloDataSchema: Schema = new Schema(
  {
    abbrev: { type: String, required: true },
    elo: { type: Number, required: true },
    season: { type: seasonSchema, required: true },
  },
  {
    collection: 'seasonelo',
  }
)

eloDataSchema.index({ abbrev: 1, season: 1 }, { unique: true })

export interface SeasonELODocument extends Document {
  abbrev: string
  elo: number
  season: {
    startYear: number
    endYear: number
  }
}

export const SeasonELOModel: Model<SeasonELODocument> =
  mongoose.model<SeasonELODocument>('seasonelo', eloDataSchema)
