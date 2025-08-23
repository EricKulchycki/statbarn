import mongoose, { Schema, Document, Model } from 'mongoose'

interface PredictionDocument extends Document {
  gameId: number // Unique identifier for the game
  homeTeam: string // Abbreviation of the home team
  awayTeam: string // Abbreviation of the away team
  homeTeamWinProbability: number // Probability of the home team winning
  awayTeamWinProbability: number // Probability of the away team winning
  predictedWinner: string // Abbreviation of the predicted winner
  gameDate: Date // Date of the game
  modelVersion: string // Version of the model used for prediction
  result?: {
    homeTeamScore: number // Score of the home team
    awayTeamScore: number // Score of the away team
    winner: string // Abbreviation of the actual winner
    correctPrediction: boolean // Whether the prediction was correct
  }
}

const predictionSchema: Schema = new Schema(
  {
    gameId: { type: Number, required: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    homeTeamWinProbability: { type: Number, required: true },
    awayTeamWinProbability: { type: Number, required: true },
    predictedWinner: { type: String, required: true },
    gameDate: { type: Date, required: true },
    modelVersion: { type: String, required: true },
    result: {
      homeTeamScore: { type: Number, required: true },
      awayTeamScore: { type: Number, required: true },
      winner: { type: String, required: true },
      correctPrediction: { type: Boolean, required: true },
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
)

const PredictionModel: Model<PredictionDocument> =
  mongoose.models.Prediction ||
  mongoose.model<PredictionDocument>('Prediction', predictionSchema)

interface Prediction {
  gameId: number
  homeTeam: string
  awayTeam: string
  homeTeamWinProbability: number
  awayTeamWinProbability: number
  predictedWinner: string
  gameDate: Date
  modelVersion: string
  result?: {
    homeTeamScore: number
    awayTeamScore: number
    winner: string
    correctPrediction: boolean
  }
}

export type { PredictionDocument, Prediction }
export { PredictionModel }
