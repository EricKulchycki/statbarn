import { Database } from '../lib/db'
import { getTeams } from '../app/data/teams'
import { processMultipleSeasons } from '../lib/eloCalculator'
import { GameELOModel } from '../models/gameElo'
import { PredictionModel } from '../models/prediction'
import { SeasonELOModel } from '../models/elo'

/**
 * Seed script for historical ELO data from the last 10 years
 * This script processes every game chronologically, ensuring ELO progression
 */
async function seedHistoricalElo() {
  const db = Database.getInstance()

  try {
    console.log('🚀 Starting historical ELO seeding...')

    // Connect to database
    await db.connect()
    console.log('✅ Connected to database')

    // Clear existing data (optional - comment out if you want to preserve)
    console.log('🧹 Clearing existing data...')
    await GameELOModel.deleteMany({})
    await PredictionModel.deleteMany({})
    await SeasonELOModel.deleteMany({})
    console.log('✅ Cleared existing data')

    // Get all teams
    console.log('🏒 Fetching teams...')
    const teams = await getTeams()
    console.log(`✅ Found ${teams.length} teams`)

    // Calculate start season (10 years ago)
    const currentYear = new Date().getFullYear()
    const startSeason = currentYear - 10
    const endSeason = currentYear - 1 // Last completed season

    console.log(
      `📅 Processing seasons from ${startSeason}-${startSeason + 1} to ${endSeason}-${endSeason + 1}`
    )
    console.log(
      `📊 This will process approximately ${(endSeason - startSeason + 1) * 1230} games (82 games × 30 teams × ${endSeason - startSeason + 1} seasons)`
    )

    // Process all seasons
    await processMultipleSeasons(startSeason, endSeason, teams)

    console.log('\n🎉 Historical ELO seeding completed successfully!')

    // Print summary statistics
    const gameEloCount = await GameELOModel.countDocuments()
    const predictionCount = await PredictionModel.countDocuments()
    const seasonEloCount = await SeasonELOModel.countDocuments()

    console.log('\n📊 Final Statistics:')
    console.log(`   Game ELO records: ${gameEloCount}`)
    console.log(`   Predictions: ${predictionCount}`)
    console.log(`   Season ELO records: ${seasonEloCount}`)

    // Show sample of final ELOs
    const finalElos = await SeasonELOModel.find({
      season: { startYear: endSeason, endYear: endSeason + 1 },
    })
      .sort({ elo: -1 })
      .limit(10)

    console.log('\n🏆 Top 10 ELO Ratings (Final Season):')
    finalElos.forEach((elo, index) => {
      console.log(`   ${index + 1}. ${elo.abbrev}: ${elo.elo.toFixed(1)}`)
    })
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  } finally {
    // Disconnect from database
    db.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

/**
 * Validate the seeded data
 */
async function validateSeededData() {
  const db = Database.getInstance()

  try {
    await db.connect()
    console.log('\n🔍 Validating seeded data...')

    // Check for data consistency
    const gameEloCount = await GameELOModel.countDocuments()
    const predictionCount = await PredictionModel.countDocuments()
    const seasonEloCount = await SeasonELOModel.countDocuments()

    if (gameEloCount === 0) {
      throw new Error('No game ELO records found')
    }

    if (predictionCount === 0) {
      throw new Error('No predictions found')
    }

    if (seasonEloCount === 0) {
      throw new Error('No season ELO records found')
    }

    // Check for duplicate game IDs
    const duplicateGames = await GameELOModel.aggregate([
      { $group: { _id: '$gameId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ])

    if (duplicateGames.length > 0) {
      console.warn('⚠️  Warning: Found duplicate game IDs:', duplicateGames)
    }

    // Check ELO progression
    const sampleTeam = await GameELOModel.findOne({})
    if (sampleTeam) {
      const teamGames = await GameELOModel.find({
        $or: [
          { 'homeTeam.abbrev': sampleTeam.homeTeam.abbrev },
          { 'awayTeam.abbrev': sampleTeam.homeTeam.abbrev },
        ],
      })
        .sort({ gameDate: 1 })
        .limit(5)

      console.log(
        `\n📈 Sample ELO progression for ${sampleTeam.homeTeam.abbrev}:`
      )
      teamGames.forEach((game, index) => {
        const isHome = game.homeTeam.abbrev === sampleTeam.homeTeam.abbrev
        const eloBefore = isHome
          ? game.homeTeam.eloBefore
          : game.awayTeam.eloBefore
        const eloAfter = isHome
          ? game.homeTeam.eloAfter
          : game.awayTeam.eloAfter
        const change = isHome
          ? game.eloChange.homeTeam
          : game.eloChange.awayTeam

        console.log(
          `   Game ${index + 1}: ${eloBefore.toFixed(1)} → ${eloAfter.toFixed(1)} (${change > 0 ? '+' : ''}${change.toFixed(1)})`
        )
      })
    }

    console.log('✅ Data validation completed successfully')
  } catch (error) {
    console.error('❌ Data validation failed:', error)
    throw error
  } finally {
    db.disconnect()
  }
}

// Main execution
seedHistoricalElo()
  .then(() => validateSeededData())
  .then(() => {
    console.log('\n🎯 All done! Your historical ELO data is ready.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error)
    process.exit(1)
  })

export { seedHistoricalElo, validateSeededData }
