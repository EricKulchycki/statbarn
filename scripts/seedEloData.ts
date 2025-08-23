import { Database } from '../lib/db.js'
import { calculateSeasonELO } from '../lib/elo.js'
import { SeasonELOModel } from '../models/elo.js'
import { PredictionModel } from '../models/prediction.js'
import { getTeams } from '../app/data/teams.js'
import { SeasonELO } from '../app/types/elo.js'
;(async () => {
  const db = Database.getInstance()

  try {
    // Connect to the database
    await db.connect()

    await SeasonELOModel.deleteMany({})
    await PredictionModel.deleteMany({})

    const teams = await getTeams()

    // Seed data
    let season = 2021
    let lastSeasonData: SeasonELO[] = []
    while (season < 2025) {
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
