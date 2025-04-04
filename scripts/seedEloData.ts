import mongoose, { Schema, Document, Model } from 'mongoose'
import { Database } from '../lib/db'
import { calculateSeasonELO, SeasonELO } from 'lib/elo'
import { getTeams } from '~/data/teams'

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

interface SeasonELODocument extends Document {}

// Create the model
const SeasonELOModel: Model<SeasonELODocument> =
  mongoose.model<SeasonELODocument>('seasonelo', eloDataSchema)

;(async () => {
  const db = Database.getInstance()

  try {
    // Connect to the database
    await db.connect()

    const teams = await getTeams()

    // Seed data
    let season = 2020
    let lastSeasonData: SeasonELO[] = []
    while (season < 2024) {
      const seedData: SeasonELO[] = await calculateSeasonELO(
        `${season}${season + 1}`,
        teams,
        lastSeasonData
      )
      lastSeasonData = seedData
      season += 1

      // Insert seed data
      await SeasonELOModel.insertMany(seedData)
    }

    console.log('Seed data inserted successfully.')
  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    // Disconnect from the database
    db.disconnect()
  }
})()
