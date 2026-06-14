import { DateTime } from 'luxon'
import mongoose from 'mongoose'
import { ELO_CONFIG } from '../src/constants'
import {
  recalculatePredictionsForTeam,
  saveTeamGameOutcome,
} from '../src/data/teams'
import { Database } from '../src/lib/db'
import { calculateGameELO } from '../src/lib/eloCalculator'
import { TeamModel } from '../src/models/team'
import { NHLGame } from '../src/types/game'

const INITIAL_ELO = ELO_CONFIG.initialRating

async function fetchSchedule(date: string): Promise<{
  gameWeek: { games: NHLGame[] }[]
  nextStartDate: string
  regularSeasonEndDate?: string
}> {
  const res = await fetch(`https://api-web.nhle.com/v1/schedule/${date}`)
  if (!res.ok)
    throw new Error(`Failed to fetch schedule for ${date}: ${res.statusText}`)
  return res.json()
}

async function buildEloMap(): Promise<Record<string, number>> {
  const teamDocs = await TeamModel.find(
    {},
    { triCode: 1, currentElo: 1 }
  ).lean()
  const eloMap: Record<string, number> = {}
  for (const t of teamDocs) {
    eloMap[t.triCode] = t.currentElo ?? INITIAL_ELO
  }
  return eloMap
}

async function processGames(
  games: NHLGame[],
  eloMap: Record<string, number>
): Promise<void> {
  const season = games[0].season

  for (const game of games) {
    const home = game.homeTeam.abbrev
    const away = game.awayTeam.abbrev
    const homeScore = game.homeTeam.score
    const awayScore = game.awayTeam.score
    const gameDate = new Date(game.startTimeUTC)

    const result = await calculateGameELO(game, eloMap)

    await Promise.all([
      saveTeamGameOutcome(
        home,
        season,
        { gameId: game.id, gameDate, opponent: away, isHome: true },
        result.homeTeam.eloBefore,
        {
          actualWin: homeScore > awayScore,
          eloAfter: result.homeTeam.eloAfter,
          eloChange: result.homeTeam.eloChange,
          score: { team: homeScore, opponent: awayScore },
        }
      ),
      saveTeamGameOutcome(
        away,
        season,
        { gameId: game.id, gameDate, opponent: home, isHome: false },
        result.awayTeam.eloBefore,
        {
          actualWin: awayScore > homeScore,
          eloAfter: result.awayTeam.eloAfter,
          eloChange: result.awayTeam.eloChange,
          score: { team: awayScore, opponent: homeScore },
        }
      ),
    ])

    eloMap[home] = result.homeTeam.eloAfter
    eloMap[away] = result.awayTeam.eloAfter

    await Promise.all([
      recalculatePredictionsForTeam(home, season, eloMap),
      recalculatePredictionsForTeam(away, season, eloMap),
    ])

    console.log(
      `  ${away} @ ${home}  ${awayScore}-${homeScore}  ELO: ${home} ${result.homeTeam.eloBefore.toFixed(1)} → ${result.homeTeam.eloAfter.toFixed(1)}, ${away} ${result.awayTeam.eloBefore.toFixed(1)} → ${result.awayTeam.eloAfter.toFixed(1)}`
    )
  }
}

async function processDate(
  dateStr: string,
  eloMap: Record<string, number>
): Promise<void> {
  const schedule = await fetchSchedule(dateStr)
  const games = (schedule.gameWeek[0]?.games ?? []).filter(
    (g) => g.gameType === 2 && g.gameState === 'OFF'
  )

  if (games.length === 0) {
    console.log('No completed regular season games found for this date.')
    return
  }

  console.log(`Found ${games.length} completed games.`)
  await processGames(games, eloMap)
}

async function processSeason(season: string): Promise<void> {
  const startYear = season.slice(0, 4)
  let currentDate = `${startYear}-10-01`
  let regularSeasonEnd = ''
  let totalGames = 0

  console.log(`Fetching season ${season} schedule...`)

  // Collect all days with completed regular season games, in order
  const gameDays: { date: string; games: NHLGame[] }[] = []

  while (true) {
    const week = await fetchSchedule(currentDate)

    if (!regularSeasonEnd && week.regularSeasonEndDate) {
      regularSeasonEnd = week.regularSeasonEndDate
      console.log(`Season ends: ${regularSeasonEnd}`)
    }

    for (const day of week.gameWeek) {
      const completed = day.games.filter(
        (g) => g.gameType === 2 && g.gameState === 'OFF'
      )
      if (completed.length > 0) {
        gameDays.push({
          date: (day as unknown as { date: string }).date,
          games: completed,
        })
        totalGames += completed.length
      }
    }

    const next = week.nextStartDate
    if (!next || (regularSeasonEnd && next > regularSeasonEnd)) break
    currentDate = next

    await new Promise((r) => setTimeout(r, 100))
  }

  console.log(
    `Found ${totalGames} completed games across ${gameDays.length} days. Processing...`
  )

  const eloMap = await buildEloMap()

  for (const { date, games } of gameDays) {
    console.log(`\n${date} (${games.length} games)`)
    await processGames(games, eloMap)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const seasonFlag = args.indexOf('--season')

  const db = Database.getInstance()
  await db.connect()

  if (seasonFlag !== -1) {
    const season = args[seasonFlag + 1]
    if (!season || !/^\d{8}$/.test(season)) {
      console.error('Usage: --season YYYYYYY (e.g. --season 20252026)')
      process.exit(1)
    }
    await processSeason(season)
  } else {
    const dateArg = args[0]
    const date = dateArg
      ? DateTime.fromISO(dateArg)
      : DateTime.now().minus({ days: 1 }).startOf('day')

    if (!date.isValid) {
      console.error('Invalid date. Use YYYY-MM-DD format.')
      process.exit(1)
    }

    const dateStr = date.toISODate()!
    console.log(`Processing outcomes for: ${dateStr}`)
    const eloMap = await buildEloMap()
    await processDate(dateStr, eloMap)
  }

  await mongoose.disconnect()
  console.log('Done!')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
