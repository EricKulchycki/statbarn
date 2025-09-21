import { scheduleService } from '../src/services/schedule.service'
import { eloService } from '../src/services/elo.service'
import { PredictionModel } from '../src/models/prediction'
import { calculateGameELO } from '../src/lib/eloCalculator'
import { Database } from '../src/lib/db'

async function seedPredictionsForDate(date: string) {
  const db = Database.getInstance()
  await db.connect()
  console.log(`Seeding predictions for date: ${date}`)

  // 1. Get schedule for the date
  const schedule = await scheduleService.getScheduleByDate(date)
  const games = schedule.gameWeek[0]?.games || []

  // 2. Get latest ELOs for all teams
  const latestElos = await eloService.getLatestElos()
  const eloMap = Object.fromEntries(latestElos.map((e) => [e.abbrev, e.elo]))

  let seeded = 0
  for (const game of games) {
    // 3. Calculate prediction using ELO logic
    const { prediction } = await calculateGameELO(game, eloMap)

    // 4. Upsert prediction in DB
    await PredictionModel.findOneAndUpdate(
      { gameId: prediction.gameId },
      prediction,
      { upsert: true, new: true }
    )
    seeded++
  }

  console.log(`Seeded ${seeded} predictions for ${date}`)
}

// Usage: node scripts/seedPredictionForDate.js YYYY-MM-DD
const dateArg = process.argv[2]
if (!dateArg) {
  console.error('Please provide a date in YYYY-MM-DD format.')
  process.exit(1)
}

seedPredictionsForDate(dateArg)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error seeding predictions:', err)
    process.exit(1)
  })
