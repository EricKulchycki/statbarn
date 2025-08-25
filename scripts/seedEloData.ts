import { Database } from '../src/lib/db.js'
import { calculateSeasonELO } from '../src/lib/elo.js'
import { SeasonELOModel } from '../src/models/elo.js'
import { PredictionModel } from '../src/models/prediction.js'
import { getTeams } from '../src/data/teams.js'
import { SeasonELO } from '../src/types/elo.js'
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
