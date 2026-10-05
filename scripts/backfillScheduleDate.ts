import mongoose from 'mongoose'
import { Database } from '../src/lib/db'
import { TeamModel } from '../src/models/team'
import { NHLGameWeek } from '../src/types/game'

const dryRun = process.argv.includes('--dry-run')

async function fetchSchedule(date: string): Promise<NHLGameWeek> {
  const res = await fetch(`https://api-web.nhle.com/v1/schedule/${date}`)
  if (!res.ok)
    throw new Error(`Failed to fetch schedule for ${date}: ${res.statusText}`)
  return res.json()
}

async function fetchSeasonScheduleDates(
  season: number
): Promise<Map<number, string>> {
  const startYear = String(season).slice(0, 4)
  let currentDate = `${startYear}-09-01`
  let regularSeasonEnd = ''
  const dates = new Map<number, string>()

  while (true) {
    const week = await fetchSchedule(currentDate)

    if (!regularSeasonEnd && week.regularSeasonEndDate) {
      regularSeasonEnd = week.regularSeasonEndDate
    }

    for (const day of week.gameWeek) {
      for (const game of day.games) {
        dates.set(game.id, day.date)
      }
    }

    const next = week.nextStartDate
    if (!next || (regularSeasonEnd && next > regularSeasonEnd)) break
    currentDate = next

    await new Promise((r) => setTimeout(r, 100))
  }

  return dates
}

async function main() {
  const db = Database.getInstance()
  await db.connect()

  const seasons: number[] = await TeamModel.distinct('seasons.season')
  const scheduleDates = new Map<number, string>()

  for (const season of seasons) {
    console.log(`Fetching schedule for ${season}...`)
    const dates = await fetchSeasonScheduleDates(season)
    dates.forEach((date, gameId) => scheduleDates.set(gameId, date))
    console.log(`  ${dates.size} games`)
  }

  const teams = await TeamModel.find({})
  let updated = 0
  const missing: number[] = []

  for (const team of teams) {
    let changed = false

    for (const season of team.seasons) {
      for (const game of season.games) {
        const scheduleDate = scheduleDates.get(game.gameId)
        if (!scheduleDate) {
          missing.push(game.gameId)
          continue
        }
        if (game.scheduleDate !== scheduleDate) {
          game.scheduleDate = scheduleDate
          changed = true
          updated++
        }
      }
    }

    if (changed && !dryRun) {
      team.markModified('seasons')
      await team.save()
    }
  }

  console.log(
    `${dryRun ? '[dry run] Would update' : 'Updated'} ${updated} game entries.`
  )
  if (missing.length > 0) {
    console.warn(
      `No schedule date found for ${missing.length} entries: ${[...new Set(missing)].join(', ')}`
    )
  }

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
