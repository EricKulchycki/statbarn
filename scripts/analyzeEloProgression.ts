import { Database } from '../src/lib/db.js'
import { GameELOModel } from '../src/models/gameElo.js'
import { SeasonELOModel } from '../src/models/elo.js'
import { PredictionModel } from '../src/models/prediction.js'

/**
 * Analyze ELO progression and data quality
 */
async function analyzeEloProgression() {
  const db = Database.getInstance()

  try {
    await db.connect()
    console.log('🔍 Starting ELO progression analysis...')

    // Get overall statistics
    const totalGames = await GameELOModel.countDocuments()
    const totalSeasons = await SeasonELOModel.distinct('season.startYear')
    const totalTeams = await SeasonELOModel.distinct('abbrev')

    console.log('\n📊 Overall Statistics:')
    console.log(`   Total games processed: ${totalGames}`)
    console.log(`   Seasons covered: ${totalSeasons.length} (${Math.min(...totalSeasons)}-${Math.max(...totalSeasons)})`)
    console.log(`   Teams tracked: ${totalTeams.length}`)

    // Analyze ELO distribution by season
    console.log('\n📈 ELO Distribution by Season:')
    for (const year of totalSeasons.sort()) {
      const seasonElos = await SeasonELOModel.find({
        season: { startYear: year, endYear: year + 1 }
      }).sort({ elo: -1 })

      if (seasonElos.length > 0) {
        const avgElo = seasonElos.reduce((sum, elo) => sum + elo.elo, 0) / seasonElos.length
        const minElo = Math.min(...seasonElos.map(e => e.elo))
        const maxElo = Math.max(...seasonElos.map(e => e.elo))
        const spread = maxElo - minElo

        console.log(`   ${year}-${year + 1}: Avg: ${avgElo.toFixed(1)}, Range: ${minElo.toFixed(1)}-${maxElo.toFixed(1)} (Spread: ${spread.toFixed(1)})`)
      }
    }

    // Analyze prediction accuracy
    console.log('\n🎯 Prediction Accuracy Analysis:')
    const totalPredictions = await PredictionModel.countDocuments()
    const correctPredictions = await PredictionModel.countDocuments({
      'result.correctPrediction': true
    })
    const accuracy = (correctPredictions / totalPredictions) * 100

    console.log(`   Total predictions: ${totalPredictions}`)
    console.log(`   Correct predictions: ${correctPredictions}`)
    console.log(`   Accuracy: ${accuracy.toFixed(2)}%`)

    // Analyze ELO changes
    console.log('\n📊 ELO Change Analysis:')
    const eloChanges = await GameELOModel.aggregate([
      {
        $group: {
          _id: null,
          avgHomeChange: { $avg: '$eloChange.homeTeam' },
          avgAwayChange: { $avg: '$eloChange.awayTeam' },
          maxHomeChange: { $max: '$eloChange.homeTeam' },
          maxAwayChange: { $max: '$eloChange.awayTeam' },
          minHomeChange: { $min: '$eloChange.homeTeam' },
          minAwayChange: { $min: '$eloChange.awayTeam' }
        }
      }
    ])

    if (eloChanges.length > 0) {
      const stats = eloChanges[0]
      console.log(`   Average ELO changes:`)
      console.log(`     Home teams: ${stats.avgHomeChange.toFixed(2)}`)
      console.log(`     Away teams: ${stats.avgAwayChange.toFixed(2)}`)
      console.log(`   ELO change ranges:`)
      console.log(`     Home: ${stats.minHomeChange.toFixed(2)} to ${stats.maxHomeChange.toFixed(2)}`)
      console.log(`     Away: ${stats.minAwayChange.toFixed(2)} to ${stats.maxAwayChange.toFixed(2)}`)
    }

    // Analyze team performance over time
    console.log('\n🏆 Top Teams Analysis:')
    const topTeams = await SeasonELOModel.find({
      season: { startYear: Math.max(...totalSeasons), endYear: Math.max(...totalSeasons) + 1 }
    }).sort({ elo: -1 }).limit(5)

    console.log(`   Top 5 teams (${Math.max(...totalSeasons)}-${Math.max(...totalSeasons) + 1}):`)
    topTeams.forEach((team, index) => {
      console.log(`     ${index + 1}. ${team.abbrev}: ${team.elo.toFixed(1)}`)
    })

    // Analyze ELO progression for a sample team
    console.log('\n📈 Sample Team ELO Progression:')
    if (topTeams.length > 0) {
      const sampleTeam = topTeams[0].abbrev
      const teamGames = await GameELOModel.find({
        $or: [
          { 'homeTeam.abbrev': sampleTeam },
          { 'awayTeam.abbrev': sampleTeam }
        ]
      }).sort({ gameDate: 1 }).limit(10)

      console.log(`   ${sampleTeam} ELO progression (last 10 games):`)
      teamGames.forEach((game, index) => {
        const isHome = game.homeTeam.abbrev === sampleTeam
        const eloBefore = isHome ? game.homeTeam.eloBefore : game.awayTeam.eloBefore
        const eloAfter = isHome ? game.homeTeam.eloAfter : game.awayTeam.eloAfter
        const change = isHome ? game.eloChange.homeTeam : game.eloChange.awayTeam
        const opponent = isHome ? game.awayTeam.abbrev : game.homeTeam.abbrev
        const result = isHome ? 
          (game.homeTeam.score > game.awayTeam.score ? 'W' : 'L') :
          (game.awayTeam.score > game.homeTeam.score ? 'W' : 'L')

        console.log(`     Game ${index + 1}: vs ${opponent} (${result}) ${eloBefore.toFixed(1)} → ${eloAfter.toFixed(1)} (${change > 0 ? '+' : ''}${change.toFixed(1)})`)
      })
    }

    // Check for data quality issues
    console.log('\n🔍 Data Quality Checks:')

    // Check for games with missing scores
    const gamesWithMissingScores = await GameELOModel.countDocuments({
      $or: [
        { 'homeTeam.score': { $exists: false } },
        { 'awayTeam.score': { $exists: false } }
      ]
    })

    if (gamesWithMissingScores > 0) {
      console.log(`   ⚠️  Games with missing scores: ${gamesWithMissingScores}`)
    } else {
      console.log(`   ✅ All games have complete score data`)
    }

    // Check for duplicate game IDs
    const duplicateGames = await GameELOModel.aggregate([
      { $group: { _id: '$gameId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ])

    if (duplicateGames.length > 0) {
      console.log(`   ⚠️  Duplicate game IDs found: ${duplicateGames.length}`)
    } else {
      console.log(`   ✅ No duplicate game IDs found`)
    }

    // Check for ELO outliers
    const eloOutliers = await SeasonELOModel.find({
      $or: [
        { elo: { $lt: 1000 } },
        { elo: { $gt: 2000 } }
      ]
    })

    if (eloOutliers.length > 0) {
      console.log(`   ⚠️  ELO outliers found: ${eloOutliers.length}`)
      eloOutliers.forEach(elo => {
        console.log(`     ${elo.abbrev}: ${elo.elo.toFixed(1)} (Season: ${elo.season.startYear}-${elo.season.endYear})`)
      })
    } else {
      console.log(`   ✅ No extreme ELO outliers found`)
    }

    console.log('\n✅ Analysis completed successfully!')

  } catch (error) {
    console.error('❌ Analysis failed:', error)
    throw error
  } finally {
    db.disconnect()
  }
}

// Main execution
analyzeEloProgression()
  .then(() => {
    console.log('\n🎯 Analysis completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Analysis failed:', error)
    process.exit(1)
  })

export { analyzeEloProgression }
