import { Database } from '../src/lib/db'
import { GameELOModel } from '../src/models/gameElo'
import { DateTime } from 'luxon'

const db = Database.getInstance()

// Sample teams with realistic ELO ratings
const teams = [
  { abbrev: 'TOR', name: 'Toronto Maple Leafs', elo: 1580 },
  { abbrev: 'BOS', name: 'Boston Bruins', elo: 1620 },
  { abbrev: 'FLA', name: 'Florida Panthers', elo: 1595 },
  { abbrev: 'NYR', name: 'New York Rangers', elo: 1570 },
  { abbrev: 'COL', name: 'Colorado Avalanche', elo: 1610 },
  { abbrev: 'VGK', name: 'Vegas Golden Knights', elo: 1585 },
  { abbrev: 'EDM', name: 'Edmonton Oilers', elo: 1600 },
  { abbrev: 'DAL', name: 'Dallas Stars', elo: 1575 },
  { abbrev: 'CAR', name: 'Carolina Hurricanes', elo: 1565 },
  { abbrev: 'NJD', name: 'New Jersey Devils', elo: 1555 },
  { abbrev: 'WSH', name: 'Washington Capitals', elo: 1520 },
  { abbrev: 'TBL', name: 'Tampa Bay Lightning', elo: 1540 },
]

function calculateExpectedResult(homeElo: number, awayElo: number) {
  const homeExpected = 1 / (1 + Math.pow(10, (awayElo - homeElo) / 400))
  const awayExpected = 1 - homeExpected
  return { homeTeam: homeExpected, awayTeam: awayExpected }
}

function getRandomTeams() {
  const shuffled = [...teams].sort(() => Math.random() - 0.5)
  return {
    home: shuffled[0],
    away: shuffled[1],
  }
}

async function seedTestGames() {
  try {
    await db.connect()
    console.log('Connected to database')

    console.log('Deleting previous games')
    await GameELOModel.deleteMany()

    const yesterday = DateTime.now().minus({ days: 1 })
    const today = DateTime.now()
    const season = 20252026

    const gamesToSeed = []
    let gameId = 2025020500 // Starting game ID

    // Yesterday's games - FINAL (Correct predictions)
    console.log(
      "\n📊 Creating yesterday's FINAL games (correct predictions)..."
    )
    for (let i = 0; i < 3; i++) {
      const { home, away } = getRandomTeams()
      const gameDate = yesterday.set({ hour: 19, minute: 0 }).toJSDate()

      // Higher ELO team wins
      const homeWins = home.elo > away.elo
      const homeScore = homeWins ? 4 : 2
      const awayScore = homeWins ? 2 : 4

      const expectedResult = calculateExpectedResult(home.elo, away.elo)
      const eloChangeHome = homeWins ? 15 : -15
      const eloChangeAway = homeWins ? -15 : 15

      gamesToSeed.push({
        gameId: gameId++,
        season,
        gameType: 'regular',
        gameDate,
        homeTeam: {
          abbrev: home.abbrev,
          score: homeScore,
          eloBefore: home.elo,
          eloAfter: home.elo + eloChangeHome,
        },
        awayTeam: {
          abbrev: away.abbrev,
          score: awayScore,
          eloBefore: away.elo,
          eloAfter: away.elo + eloChangeAway,
        },
        eloChange: {
          homeTeam: eloChangeHome,
          awayTeam: eloChangeAway,
        },
        kFactor: 32,
        homeAdvantage: 25,
        expectedResult,
        actualResult: {
          homeTeam: homeWins ? 1 : 0,
          awayTeam: homeWins ? 0 : 1,
        },
        modelVersion: 'v1',
      })
    }

    // Yesterday's games - FINAL (Upsets/Wrong predictions)
    console.log("🎲 Creating yesterday's FINAL games (upsets)...")
    for (let i = 0; i < 2; i++) {
      const { home, away } = getRandomTeams()
      const gameDate = yesterday.set({ hour: 19, minute: 30 }).toJSDate()

      // Lower ELO team wins (upset!)
      const homeWins = home.elo < away.elo
      const homeScore = homeWins ? 3 : 1
      const awayScore = homeWins ? 1 : 3

      const expectedResult = calculateExpectedResult(home.elo, away.elo)
      const eloChangeHome = homeWins ? 20 : -20
      const eloChangeAway = homeWins ? -20 : 20

      gamesToSeed.push({
        gameId: gameId++,
        season,
        gameType: 'regular',
        gameDate,
        homeTeam: {
          abbrev: home.abbrev,
          score: homeScore,
          eloBefore: home.elo,
          eloAfter: home.elo + eloChangeHome,
        },
        awayTeam: {
          abbrev: away.abbrev,
          score: awayScore,
          eloBefore: away.elo,
          eloAfter: away.elo + eloChangeAway,
        },
        eloChange: {
          homeTeam: eloChangeHome,
          awayTeam: eloChangeAway,
        },
        kFactor: 32,
        homeAdvantage: 25,
        expectedResult,
        actualResult: {
          homeTeam: homeWins ? 1 : 0,
          awayTeam: homeWins ? 0 : 1,
        },
        modelVersion: 'v1',
      })
    }

    // Today's games - LIVE (Prediction currently correct)
    console.log("🔴 Creating today's LIVE games (prediction correct so far)...")
    for (let i = 0; i < 2; i++) {
      const { home, away } = getRandomTeams()
      const gameDate = today.set({ hour: 19, minute: 0 }).toJSDate()

      // Higher ELO team is currently winning
      const homeWinning = home.elo > away.elo
      const homeScore = homeWinning ? 2 : 1
      const awayScore = homeWinning ? 1 : 2

      const expectedResult = calculateExpectedResult(home.elo, away.elo)

      gamesToSeed.push({
        gameId: gameId++,
        season,
        gameType: 'regular',
        gameDate,
        homeTeam: {
          abbrev: home.abbrev,
          score: homeScore,
          eloBefore: home.elo,
          eloAfter: home.elo, // Don't update until game is final
        },
        awayTeam: {
          abbrev: away.abbrev,
          score: awayScore,
          eloBefore: away.elo,
          eloAfter: away.elo,
        },
        eloChange: {
          homeTeam: 0,
          awayTeam: 0,
        },
        kFactor: 32,
        homeAdvantage: 25,
        expectedResult,
        actualResult: {
          homeTeam: homeWinning ? 1 : 0,
          awayTeam: homeWinning ? 0 : 1,
        },
        modelVersion: 'v1',
      })
    }

    // Today's games - LIVE (Upset in progress)
    console.log("😱 Creating today's LIVE games (upset in progress)...")
    for (let i = 0; i < 2; i++) {
      const { home, away } = getRandomTeams()
      const gameDate = today.set({ hour: 19, minute: 30 }).toJSDate()

      // Lower ELO team is currently winning (upset!)
      const homeWinning = home.elo < away.elo
      const homeScore = homeWinning ? 3 : 0
      const awayScore = homeWinning ? 0 : 3

      const expectedResult = calculateExpectedResult(home.elo, away.elo)

      gamesToSeed.push({
        gameId: gameId++,
        season,
        gameType: 'regular',
        gameDate,
        homeTeam: {
          abbrev: home.abbrev,
          score: homeScore,
          eloBefore: home.elo,
          eloAfter: home.elo,
        },
        awayTeam: {
          abbrev: away.abbrev,
          score: awayScore,
          eloBefore: away.elo,
          eloAfter: away.elo,
        },
        eloChange: {
          homeTeam: 0,
          awayTeam: 0,
        },
        kFactor: 32,
        homeAdvantage: 25,
        expectedResult,
        actualResult: {
          homeTeam: homeWinning ? 1 : 0,
          awayTeam: homeWinning ? 0 : 1,
        },
        modelVersion: 'v1',
      })
    }

    // Today's games - FUT (Upcoming)
    console.log("⏰ Creating today's FUT games (upcoming)...")
    for (let i = 0; i < 4; i++) {
      const { home, away } = getRandomTeams()
      const gameDate = today.set({ hour: 20 + i, minute: 0 }).toJSDate()

      const expectedResult = calculateExpectedResult(home.elo, away.elo)

      gamesToSeed.push({
        gameId: gameId++,
        season,
        gameType: 'regular',
        gameDate,
        homeTeam: {
          abbrev: home.abbrev,
          score: 0,
          eloBefore: home.elo,
          eloAfter: home.elo,
        },
        awayTeam: {
          abbrev: away.abbrev,
          score: 0,
          eloBefore: away.elo,
          eloAfter: away.elo,
        },
        eloChange: {
          homeTeam: 0,
          awayTeam: 0,
        },
        kFactor: 32,
        homeAdvantage: 25,
        expectedResult,
        actualResult: {
          homeTeam: 0.5,
          awayTeam: 0.5,
        },
        modelVersion: 'v1',
      })
    }

    // Insert all games
    console.log('\n💾 Inserting games into database...')
    await GameELOModel.insertMany(gamesToSeed)

    console.log('\n✅ Successfully seeded test games!')
    console.log(`   - ${gamesToSeed.length} total games created`)
    console.log(`   - Yesterday: 5 games (3 correct predictions, 2 upsets)`)
    console.log(`   - Today: 4 games (simulating live - 2 correct, 2 upsets)`)
    console.log(`   - Today: 4 games (future predictions)`)
    console.log('\n📊 Use this data to test:')
    console.log("   - Yesterday's game outcomes display")
    console.log("   - Today's game predictions")
    console.log('   - Upset highlighting')
    console.log('   - Prediction accuracy tracking')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding test games:', error)
    process.exit(1)
  }
}

seedTestGames()
