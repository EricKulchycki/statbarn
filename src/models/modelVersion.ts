import { ModelVersion } from '@/types/modelVersion'
import mongoose, { Document, Model, Schema } from 'mongoose'

export interface ModelVersionDocument extends ModelVersion, Document {}

const modelVersionSchema: Schema = new Schema(
  {
    version: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'retired'],
      required: true,
    },
    params: {
      kFactor: { type: Number, required: true },
      initialRating: { type: Number, required: true },
      homeAdvantage: { type: Number, required: true },
      meanRegressionFactor: { type: Number, required: true },
      marginOfVictory: {
        enabled: { type: Boolean, required: true },
        goalDiffCap: { type: Number, required: true },
        scale: { type: Number, required: true },
        maxK: { type: Number, required: true },
      },
      matchupMaxAdjustment: { type: Number, required: true },
    },
    notes: { type: String, default: '' },
    basedOn: { type: String },
    activatedAt: { type: Date },
    retiredAt: { type: Date },
    backtest: {
      ranAt: { type: Date },
      trainSeasons: [{ type: Number }],
      trainBrier: { type: Number },
      holdoutSeason: { type: Number },
      holdoutBrier: { type: Number },
      seasons: [
        {
          _id: false,
          season: { type: Number },
          games: { type: Number },
          brier: { type: Number },
        },
      ],
    },
  },
  {
    timestamps: true,
    collection: 'modelVersions',
  }
)

// At most one active version at a time
modelVersionSchema.index(
  { status: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
)

export const ModelVersionModel: Model<ModelVersionDocument> =
  mongoose.models.ModelVersion ||
  mongoose.model<ModelVersionDocument>('ModelVersion', modelVersionSchema)
