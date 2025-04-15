import { Database } from '../lib/db'
import { calculateSeasonELO } from 'lib/elo'
import { SeasonELOModel } from 'models/elo'
import { PredictionModel } from 'models/prediction'
import { getTeams } from '~/data/teams'
import { SeasonELO } from '~/types/elo'
;(async () => {
  const db = Database.getInstance()

  try {
    // Connect to the database
    await db.connect()

    await SeasonELOModel.deleteMany({})
    await PredictionModel.deleteMany({})

    const teams = await getTeams()

    // Seed data
    let season = 2020
    let lastSeasonData: SeasonELO[] = []
    while (season < 2024) {
      const seedData: SeasonELO[] = await calculateSeasonELO(
        `${season}${season + 1}`,
        teams,
        lastSeasonData,
        new Date(),
        'v1'
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
