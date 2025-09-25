import { NextResponse } from 'next/server'
import { Database } from '@/lib/db'
import { scheduleService } from '@/services/schedule.service'
import { calculateGameELO } from '@/lib/eloCalculator'
import { eloService } from '@/services/elo.service'
import { DateTime } from 'luxon'

export async function GET() {
  const db = Database.getInstance()
  await db.connect()
  // Get yesterday's date as a Date object
  const yesterday = DateTime.now().minus({ days: 1 }).startOf('day')

  // 1. Get all games played yesterday (from eloService)
  const gameWeek = await scheduleService.getScheduleByDate(
    yesterday.toISODate()
  )
  const games = gameWeek.gameWeek[0]?.games || []

  const latestElos = await eloService.getLatestElos()
  const eloMap = Object.fromEntries(latestElos.map((e) => [e.abbrev, e.elo]))

  let processed = 0
  for (const game of games) {
    console.log(game)
    const eloCalcResult = await calculateGameELO(game, eloMap)
    await eloService.createGameElo(eloCalcResult.gameElo)
    processed++
  }

  return NextResponse.json({ success: true, processed })
}
