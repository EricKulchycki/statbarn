import { saveTeamGameOutcome } from '@/data/teams'
import { Database } from '@/lib/db'
import { calculateGameELO } from '@/lib/eloCalculator'
import { eloService } from '@/services/elo.service'
import { getActiveModel } from '@/services/modelVersion.service'
import { scheduleService } from '@/services/schedule.service'
import { DateTime } from 'luxon'
import { NextResponse } from 'next/server'

export async function GET() {
  const db = Database.getInstance()
  await db.connect()

  const yesterday = DateTime.now().minus({ days: 1 }).startOf('day')

  const gameWeek = await scheduleService.getScheduleByDate(
    yesterday.toISODate()!
  )
  const gameDay = gameWeek.gameWeek[0]
  if (!gameDay) {
    return NextResponse.json({ success: true, processed: 0 })
  }

  const scheduleDate = gameDay.date
  const games = gameDay.games.filter(
    (g) => g.gameType === 2 && g.gameState === 'OFF'
  )

  const [latestElos, model] = await Promise.all([
    eloService.getLatestElos(),
    getActiveModel(),
  ])
  const eloMap = Object.fromEntries(latestElos.map((e) => [e.abbrev, e.elo]))

  const season = games[0]?.season ?? 0
  let processed = 0

  for (const game of games) {
    const result = await calculateGameELO(game, eloMap, model.params)
    const gameDate = new Date(game.startTimeUTC)

    await Promise.all([
      saveTeamGameOutcome(
        game.homeTeam.abbrev,
        season,
        {
          gameId: game.id,
          gameDate,
          scheduleDate,
          opponent: game.awayTeam.abbrev,
          isHome: true,
        },
        result.homeTeam.eloBefore,
        {
          actualWin: game.homeTeam.score > game.awayTeam.score,
          modelVersion: model.version,
          eloAfter: result.homeTeam.eloAfter,
          eloChange: result.homeTeam.eloChange,
          score: { team: game.homeTeam.score, opponent: game.awayTeam.score },
        }
      ),
      saveTeamGameOutcome(
        game.awayTeam.abbrev,
        season,
        {
          gameId: game.id,
          gameDate,
          scheduleDate,
          opponent: game.homeTeam.abbrev,
          isHome: false,
        },
        result.awayTeam.eloBefore,
        {
          actualWin: game.awayTeam.score > game.homeTeam.score,
          modelVersion: model.version,
          eloAfter: result.awayTeam.eloAfter,
          eloChange: result.awayTeam.eloChange,
          score: { team: game.awayTeam.score, opponent: game.homeTeam.score },
        }
      ),
    ])

    eloMap[game.homeTeam.abbrev] = result.homeTeam.eloAfter
    eloMap[game.awayTeam.abbrev] = result.awayTeam.eloAfter

    processed++
  }

  return NextResponse.json({ success: true, processed })
}
