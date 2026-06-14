import mongoose from 'mongoose'
import { ELO_CONFIG } from '../src/constants'
import { Database } from '../src/lib/db'
import { TeamModel } from '../src/models/team'
import { predictorService } from '../src/services/predictor.service'

const INITIAL_ELO = ELO_CONFIG.initialRating
const SEASON = 20252026
const SEASON_START = '2025-10-07'

interface ScheduleWeek {
  nextStartDate: string
  regularSeasonEndDate?: string
  gameWeek: Array<{
    date: string
    games: Array<{
      id: number
      gameType: number
      season: number
      startTimeUTC: string
      homeTeam: { abbrev: string }
      awayTeam: { abbrev: string }
    }>
  }>
}

async function fetchWeek(date: string): Promise<ScheduleWeek> {
  const res = await fetch(`https://api-web.nhle.com/v1/schedule/${date}`)
  if (!res.ok)
    throw new Error(`Failed to fetch schedule for ${date}: ${res.statusText}`)
  return res.json()
}

async function saveTeamSeasonPredictions(
  abbrev: string,
  season: number,
  games: Array<{
    gameId: number
    gameDate: Date
    opponent: string
    isHome: boolean
    eloBefore: number
    prediction: {
      winProbability: number
      predictedWin: boolean
      modelVersion: string
    }
  }>
): Promise<void> {
  if (games.length === 0) return

  const team = await TeamModel.findOne({ triCode: abbrev })
  if (!team) {
    console.warn(`Team not found: ${abbrev}`)
    return
  }

  let seasonDoc = team.seasons.find(
    (s: { season: number }) => s.season === season
  )
  if (!seasonDoc) {
    team.seasons.push({ season, startElo: INITIAL_ELO, games: [] })
    seasonDoc = team.seasons[team.seasons.length - 1]
  }

  for (const g of games) {
    const existing = seasonDoc.games.find(
      (sg: { gameId: number }) => sg.gameId === g.gameId
    )
    if (existing) {
      existing.prediction = g.prediction
      existing.eloBefore = g.eloBefore
    } else {
      seasonDoc.games.push(g)
    }
  }

  team.markModified('seasons')
  await team.save()
}

async function main() {
  const db = Database.getInstance()
  await db.connect()

  const allGames: ScheduleWeek['gameWeek'][0]['games'] = []
  let currentDate = SEASON_START
  let regularSeasonEnd = ''

  console.log('Fetching 2024-25 regular season schedule...')

  while (true) {
    const week = await fetchWeek(currentDate)

    if (!regularSeasonEnd && week.regularSeasonEndDate) {
      regularSeasonEnd = week.regularSeasonEndDate
      console.log(`Season ends: ${regularSeasonEnd}`)
    }

    for (const day of week.gameWeek) {
      for (const game of day.games) {
        if (game.gameType === 2) {
          allGames.push(game)
        }
      }
    }

    const next = week.nextStartDate
    if (!next || (regularSeasonEnd && next > regularSeasonEnd)) break
    currentDate = next

    await new Promise((r) => setTimeout(r, 100))
  }

  console.log(
    `Found ${allGames.length} regular season games. Computing predictions...`
  )

  const byTeam = new Map<
    string,
    Array<{
      gameId: number
      gameDate: Date
      opponent: string
      isHome: boolean
      eloBefore: number
      prediction: {
        winProbability: number
        predictedWin: boolean
        modelVersion: string
      }
    }>
  >()

  for (const game of allGames) {
    const home = game.homeTeam.abbrev
    const away = game.awayTeam.abbrev
    const gameDate = new Date(game.startTimeUTC)

    const { homeWinProbability, awayWinProbability } =
      predictorService.predictGame({
        homeAbbrev: home,
        awayAbbrev: away,
        homeElo: INITIAL_ELO,
        awayElo: INITIAL_ELO,
      })

    if (!byTeam.has(home)) byTeam.set(home, [])
    byTeam.get(home)!.push({
      gameId: game.id,
      gameDate,
      opponent: away,
      isHome: true,
      eloBefore: INITIAL_ELO,
      prediction: {
        winProbability: homeWinProbability,
        predictedWin: homeWinProbability >= 0.5,
        modelVersion: 'v1',
      },
    })

    if (!byTeam.has(away)) byTeam.set(away, [])
    byTeam.get(away)!.push({
      gameId: game.id,
      gameDate,
      opponent: home,
      isHome: false,
      eloBefore: INITIAL_ELO,
      prediction: {
        winProbability: awayWinProbability,
        predictedWin: awayWinProbability >= 0.5,
        modelVersion: 'v1',
      },
    })
  }

  console.log(`Writing predictions for ${byTeam.size} teams...`)

  for (const [abbrev, games] of byTeam.entries()) {
    await saveTeamSeasonPredictions(abbrev, SEASON, games)
    console.log(`  ${abbrev}: ${games.length} games`)
  }

  await mongoose.disconnect()
  console.log('Done!')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
