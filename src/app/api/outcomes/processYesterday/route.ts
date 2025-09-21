import { NextResponse } from 'next/server'
import { Database } from '@/lib/db'
import { scheduleService } from '@/services/schedule.service'
import { calculateGameELO } from '@/lib/eloCalculator'
import { eloService } from '@/services/elo.service'

export async function GET() {
  const db = Database.getInstance()
  await db.connect()
  // Get yesterday's date as a Date object
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  // 1. Get all games played yesterday (from eloService)
  const gameWeek = await scheduleService.getScheduleByDate(
    yesterday.toISOString().slice(0, 10)
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
