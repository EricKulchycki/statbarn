/**
 * Migration script: consolidates gameelo, predictions, and seasonelo collections
 * into nested data on team documents.
 *
 * Run with: npm run migrate:toTeamModel
 * Dry run:  npm run migrate:toTeamModel -- --dry-run
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import mongoose from 'mongoose'
import { TeamModel } from '../src/models/team'

// Load .env — must happen before mongoose.connect() reads process.env.
// Static imports are hoisted, but the connect call is inside migrate() so
// process.env is already populated by the time it runs.
try {
  const lines = readFileSync(resolve(process.cwd(), '.env'), 'utf-8').split('\n')
  for (const line of lines) {
    const m = line.match(/^([^=#\s][^=]*?)\s*=\s*(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {
  // no .env present — rely on real env vars
}

const isDryRun = process.argv.includes('--dry-run')

// ---- Shape of old collection documents ----------------------------------------

interface OldGameELO {
  _id: unknown
  gameId: number
  season: number
  gameDate: Date | string
  homeTeam: { abbrev: string; eloBefore: number; eloAfter: number; score: number }
  awayTeam: { abbrev: string; eloBefore: number; eloAfter: number; score: number }
  eloChange: { homeTeam: number; awayTeam: number }
  modelVersion?: string
}

interface OldPrediction {
  _id: unknown
  gameId: number
  homeTeam: string
  awayTeam: string
  homeTeamWinProbability: number
  awayTeamWinProbability: number
  predictedWinner: string
  gameDate: Date | string
  modelVersion: string
  result?: {
    homeTeamScore: number
    awayTeamScore: number
    winner: string
    correctPrediction: boolean
  }
}

interface OldSeasonELO {
  _id: unknown
  abbrev: string
  elo: number
  season: { startYear: number; endYear: number }
}

// ---- In-memory game entry ----------------------------------------------------

interface GameEntry {
  gameId: number
  gameDate: Date
  opponent: string
  isHome: boolean
  eloBefore: number
  prediction?: { winProbability: number; predictedWin: boolean; modelVersion: string }
  outcome?: {
    actualWin: boolean
    eloAfter: number
    eloChange: number
    score: { team: number; opponent: number }
  }
}

// ---- Main --------------------------------------------------------------------

async function migrate() {
  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB_NAME || 'main'
  if (!uri) throw new Error('MONGODB_URI is not set')

  await mongoose.connect(uri, { dbName })

  const rawDb = mongoose.connection.db
  if (!rawDb) throw new Error('No active DB connection')

  // 1. Discover collections
  const collections = (await rawDb.listCollections().toArray()).map((c) => c.name)
  console.log('Collections found:', collections.join(', '))

  const gameEloName = collections.find((n) => /gameelo/.test(n))
  const predictionName = collections.find((n) => /prediction/.test(n))
  const seasonEloName = collections.find((n) => /seasonelo/.test(n))

  console.log(`\nMapped collections:`)
  console.log(`  gameElo     → ${gameEloName ?? '(not found)'}`)
  console.log(`  predictions → ${predictionName ?? '(not found)'}`)
  console.log(`  seasonElo   → ${seasonEloName ?? '(not found)'}`)

  if (!gameEloName) {
    console.error('\nCannot find gameelo collection — nothing to migrate.')
    process.exit(1)
  }

  // 2. Load old data
  const gameElos = (await rawDb
    .collection(gameEloName)
    .find({})
    .toArray()) as unknown as OldGameELO[]
  console.log(`\nLoaded ${gameElos.length} gameElo records`)

  const predMap = new Map<number, OldPrediction>()
  if (predictionName) {
    const predictions = (await rawDb
      .collection(predictionName)
      .find({})
      .toArray()) as unknown as OldPrediction[]
    console.log(`Loaded ${predictions.length} prediction records`)
    for (const p of predictions) predMap.set(p.gameId, p)
  }

  const seasonEloMap = new Map<string, number>() // abbrev → latest elo
  if (seasonEloName) {
    const seasonElos = (await rawDb
      .collection(seasonEloName)
      .find({})
      .toArray()) as unknown as OldSeasonELO[]
    console.log(`Loaded ${seasonElos.length} seasonElo records`)
    const latestByTeam = new Map<string, { elo: number; year: number }>()
    for (const se of seasonElos) {
      const existing = latestByTeam.get(se.abbrev)
      if (!existing || se.season.startYear > existing.year) {
        latestByTeam.set(se.abbrev, { elo: se.elo, year: se.season.startYear })
      }
    }
    for (const [abbrev, { elo }] of latestByTeam) {
      seasonEloMap.set(abbrev, elo)
    }
  }

  // 3. Build per-team game lists grouped by season
  //    abbrev → season → GameEntry[]
  const teamGames = new Map<string, Map<number, GameEntry[]>>()

  const ensureBucket = (abbrev: string, season: number) => {
    if (!teamGames.has(abbrev)) teamGames.set(abbrev, new Map())
    if (!teamGames.get(abbrev)!.has(season)) teamGames.get(abbrev)!.set(season, [])
    return teamGames.get(abbrev)!.get(season)!
  }

  for (const g of gameElos) {
    const homeAbbrev = g.homeTeam.abbrev
    const awayAbbrev = g.awayTeam.abbrev
    const pred = predMap.get(g.gameId)
    const gameDate = new Date(g.gameDate)

    // Determine if the game has been played: a non-zero ELO change is definitive;
    // both sides having the same ELO before/after means the record was written for
    // a future game (ELO change = 0).
    const isCompleted =
      g.eloChange.homeTeam !== 0 || g.eloChange.awayTeam !== 0

    const homeBucket = ensureBucket(homeAbbrev, g.season)
    const awayBucket = ensureBucket(awayAbbrev, g.season)

    const homeEntry: GameEntry = {
      gameId: g.gameId,
      gameDate,
      opponent: awayAbbrev,
      isHome: true,
      eloBefore: g.homeTeam.eloBefore,
    }
    if (pred) {
      homeEntry.prediction = {
        winProbability: pred.homeTeamWinProbability,
        predictedWin: pred.predictedWinner === homeAbbrev,
        modelVersion: pred.modelVersion,
      }
    }
    if (isCompleted) {
      homeEntry.outcome = {
        actualWin: g.homeTeam.score > g.awayTeam.score,
        eloAfter: g.homeTeam.eloAfter,
        eloChange: g.eloChange.homeTeam,
        score: { team: g.homeTeam.score, opponent: g.awayTeam.score },
      }
    }
    homeBucket.push(homeEntry)

    const awayEntry: GameEntry = {
      gameId: g.gameId,
      gameDate,
      opponent: homeAbbrev,
      isHome: false,
      eloBefore: g.awayTeam.eloBefore,
    }
    if (pred) {
      awayEntry.prediction = {
        winProbability: pred.awayTeamWinProbability,
        predictedWin: pred.predictedWinner === awayAbbrev,
        modelVersion: pred.modelVersion,
      }
    }
    if (isCompleted) {
      awayEntry.outcome = {
        actualWin: g.awayTeam.score > g.homeTeam.score,
        eloAfter: g.awayTeam.eloAfter,
        eloChange: g.eloChange.awayTeam,
        score: { team: g.awayTeam.score, opponent: g.homeTeam.score },
      }
    }
    awayBucket.push(awayEntry)
  }

  console.log(`\nBuilt game buckets for ${teamGames.size} teams`)

  // 4. Write to team documents
  let updated = 0
  let skipped = 0

  for (const [abbrev, seasonMap] of teamGames) {
    const seasons = []

    for (const [season, games] of seasonMap) {
      games.sort((a, b) => a.gameDate.getTime() - b.gameDate.getTime())
      const startElo = games[0].eloBefore
      seasons.push({ season, startElo, games })
    }

    // Sort seasons ascending
    seasons.sort((a, b) => a.season - b.season)

    const currentElo = seasonEloMap.get(abbrev)

    const update: Record<string, unknown> = { seasons }
    if (currentElo !== undefined) update.currentElo = currentElo

    if (isDryRun) {
      const totalGames = seasons.reduce((s, sn) => s + sn.games.length, 0)
      console.log(
        `[dry-run] ${abbrev}: ${seasons.length} season(s), ${totalGames} game entries` +
          (currentElo !== undefined ? `, currentElo=${currentElo.toFixed(1)}` : '')
      )
      updated++
      continue
    }

    const result = await TeamModel.updateOne({ triCode: abbrev }, { $set: update })

    if (result.matchedCount === 0) {
      console.warn(`  Team not found in teams collection: ${abbrev}`)
      skipped++
    } else {
      updated++
    }
  }

  console.log(`\n${isDryRun ? '[dry-run] ' : ''}Migration complete.`)
  console.log(`  Teams updated: ${updated}`)
  if (skipped > 0) console.log(`  Teams not found: ${skipped}`)

  await mongoose.disconnect()
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
