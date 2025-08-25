import { Database } from '../src/lib/db'
import { getTeams } from '../src/data/teams'
import { processSeasonGames } from '../src/lib/eloCalculator'
import { GameELOModel } from '../src/models/gameElo'
import { PredictionModel } from '../src/models/prediction'
import { SeasonELOModel } from '../src/models/elo'
import { getCurrentNHLSeason } from '../src/utils/currentSeason'

/**
 * Seed script for current season ELO data
 * This script processes the current season and can be run incrementally
 */
async function seedCurrentSeasonElo() {
  const db = Database.getInstance()

  try {
    console.log('🚀 Starting current season ELO seeding...')

    // Connect to database
    await db.connect()
    console.log('✅ Connected to database')

    // Get current season
    const currentSeason = getCurrentNHLSeason()
    console.log(`📅 Processing current season: ${currentSeason}`)

    // Get all teams
    console.log('🏒 Fetching teams...')
    const teams = await getTeams()
    console.log(`✅ Found ${teams.length} teams`)

    // Check if we have previous season data to continue from
    const previousSeason = parseInt(currentSeason.substring(0, 4)) - 1

    let initialElos: { [abbrev: string]: number } = {}

    // Try to get ELOs from previous season
    const previousSeasonElos = await SeasonELOModel.find({
      season: { startYear: previousSeason, endYear: previousSeason + 1 },
    })

    if (previousSeasonElos.length > 0) {
      console.log(
        `📊 Found ${previousSeasonElos.length} ELO records from previous season`
      )
      initialElos = previousSeasonElos.reduce(
        (acc, elo) => {
          acc[elo.abbrev] = elo.elo
          return acc
        },
        {} as { [abbrev: string]: number }
      )

      console.log('📈 Continuing ELO progression from previous season')
    } else {
      console.log(
        '🆕 No previous season data found, starting with default ELOs (1500)'
      )
      // Set default ELO for all teams
      teams.forEach((team) => {
        initialElos[team.triCode] = 1500
      })
    }

    // Check if current season already has data
    const existingGames = await GameELOModel.find({
      season: parseInt(currentSeason),
    })

    if (existingGames.length > 0) {
      console.log(
        `⚠️  Found ${existingGames.length} existing games for current season`
      )
      console.log('🔄 Running in update mode - will skip existing games')

      // Get the latest ELOs from existing games
      const latestGame = await GameELOModel.findOne({
        season: parseInt(currentSeason),
      }).sort({ gameDate: -1 })

      if (latestGame) {
        // Update initial ELOs with the latest from this season
        initialElos[latestGame.homeTeam.abbrev] = latestGame.homeTeam.eloAfter
        initialElos[latestGame.awayTeam.abbrev] = latestGame.awayTeam.eloAfter

        console.log(
          '📊 Updated initial ELOs from latest game in current season'
        )
      }
    }

    // Process current season
    console.log('🏁 Processing current season games...')
    const result = await processSeasonGames(currentSeason, teams, initialElos)

    // Save new data (only new games)
    if (result.gameElos.length > 0) {
      // Filter out games that already exist
      const newGameElos = result.gameElos.filter(
        (gameElo) =>
          !existingGames.some((existing) => existing.gameId === gameElo.gameId)
      )

      if (newGameElos.length > 0) {
        await GameELOModel.insertMany(newGameElos)
        console.log(`✅ Saved ${newGameElos.length} new game ELO records`)
      } else {
        console.log('ℹ️  No new games to save')
      }
    }

    if (result.predictions.length > 0) {
      // Filter out predictions that already exist
      const newPredictions = result.predictions.filter(
        (prediction) =>
          !existingGames.some(
            (existing) => existing.gameId === prediction.gameId
          )
      )

      if (newPredictions.length > 0) {
        await PredictionModel.insertMany(newPredictions)
        console.log(`✅ Saved ${newPredictions.length} new predictions`)
      } else {
        console.log('ℹ️  No new predictions to save')
      }
    }

    // Update or insert season ELOs
    if (result.finalElos.length > 0) {
      for (const elo of result.finalElos) {
        await SeasonELOModel.findOneAndUpdate(
          {
            abbrev: elo.abbrev,
            season: elo.season,
          },
          elo,
          { upsert: true, new: true }
        )
      }
      console.log(`✅ Updated ${result.finalElos.length} season ELO records`)
    }

    console.log('\n🎉 Current season ELO seeding completed successfully!')

    // Print summary
    const totalGames = await GameELOModel.countDocuments({
      season: parseInt(currentSeason),
    })
    const totalPredictions = await PredictionModel.countDocuments({
      gameId: {
        $in: existingGames
          .map((g) => g.gameId)
          .concat(result.gameElos.map((g) => g.gameId)),
      },
    })

    console.log('\n📊 Current Season Summary:')
    console.log(`   Total games processed: ${totalGames}`)
    console.log(`   Total predictions: ${totalPredictions}`)

    // Show current ELO rankings
    const currentElos = await SeasonELOModel.find({
      season: {
        startYear: parseInt(currentSeason.substring(0, 4)),
        endYear: parseInt(currentSeason.substring(0, 4)) + 1,
      },
    })
      .sort({ elo: -1 })
      .limit(10)

    console.log('\n🏆 Current ELO Rankings (Top 10):')
    currentElos.forEach((elo, index) => {
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
 * Run incremental update for current season
 * This can be run periodically to update with new games
 */
async function updateCurrentSeason() {
  console.log('🔄 Running incremental update for current season...')
  await seedCurrentSeasonElo()
}

// Main execution
const command = process.argv[2]

if (command === 'update') {
  updateCurrentSeason()
    .then(() => {
      console.log('\n🎯 Incremental update completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Update failed:', error)
      process.exit(1)
    })
} else {
  seedCurrentSeasonElo()
    .then(() => {
      console.log('\n🎯 Current season seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Seeding failed:', error)
      process.exit(1)
    })
}

export { seedCurrentSeasonElo, updateCurrentSeason }
