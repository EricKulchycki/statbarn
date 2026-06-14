import { Database } from '../src/lib/db'
import { eloService } from '../src/services/elo.service'
import { predictionsService } from '../src/services/predictions.service'
import { scheduleService } from '../src/services/schedule.service'
import { NHLGame } from '../src/types/game'

async function seedPredictionsForDate(date: string) {
  const db = Database.getInstance()
  await db.connect()
  console.log(`Seeding predictions for date: ${date}`)

  const schedule = await scheduleService.getScheduleByDate(date)
  const games = (schedule.gameWeek[0]?.games || []).filter(
    (g: NHLGame) => g.gameType === 2
  )

  if (games.length === 0) {
    console.log('No regular season games found for this date.')
    return
  }

  const latestElos = await eloService.getLatestElos()
  const eloMap = Object.fromEntries(latestElos.map((e) => [e.abbrev, e.elo]))

  await predictionsService.predictGames(games, eloMap)
  console.log(`Seeded predictions for ${games.length} games on ${date}`)
}

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
