import _ from 'lodash'
import { GameELO, GameELOModel } from '@/models/gameElo'
import { Prediction, PredictionModel } from '@/models/prediction'
import { SeasonELOModel } from '@/models/elo'
import { fetchGamesForTeam } from '@/data/team-games.fetch'
import { SeasonELO } from '@/types/elo'
import { NHLGame } from '@/types/game'
import { Team } from '@/types/team'
import { Season } from '@/types/time'

export interface ELOCalculationResult {
  gameElo: GameELO
  prediction: Prediction
  newElos: { [abbrev: string]: number }
}

export interface ELOsByTeam {
  [abbrev: string]: number
}

const K_FACTOR = 32
const HOME_ADVANTAGE = 65
const INITIAL_ELO = 1500

/**
 * Calculate ELO for a single game
 */
export async function calculateGameELO(
  game: NHLGame,
  currentElos: ELOsByTeam,
  kFactor: number = K_FACTOR,
  homeAdvantage: number = HOME_ADVANTAGE
): Promise<ELOCalculationResult> {
  const homeTeam = game.homeTeam.abbrev
  const awayTeam = game.awayTeam.abbrev

  // Get current ELOs
  const homeEloBefore = currentElos[homeTeam] || INITIAL_ELO
  const awayEloBefore = currentElos[awayTeam] || INITIAL_ELO

  // Calculate expected results
  const homeEloWithAdvantage = homeEloBefore + homeAdvantage
  const awayElo = awayEloBefore

  const homeExpectedResult = calculateExpectedResult(
    homeEloWithAdvantage,
    awayElo
  )
  const awayExpectedResult = 1 - homeExpectedResult

  // Calculate actual results
  const homeActualResult = game.homeTeam.score > game.awayTeam.score ? 1 : 0
  const awayActualResult = 1 - homeActualResult

  // Calculate ELO changes
  const isInFuture = new Date(game.startTimeUTC) > new Date()
  const goalDiff = Math.abs(game.homeTeam.score - game.awayTeam.score)
  let adjustedK = kFactor
  if (!isInFuture) {
    adjustedK = adjustKFactor(kFactor, goalDiff)
  }

  const homeEloChange = adjustedK * (homeActualResult - homeExpectedResult)
  const awayEloChange = adjustedK * (awayActualResult - awayExpectedResult)

  // Calculate new ELOs
  const homeEloAfter = homeEloBefore + homeEloChange
  const awayEloAfter = awayEloBefore + awayEloChange

  // Create game ELO record
  const gameElo: GameELO = {
    gameId: game.id,
    season: game.season,
    gameDate: new Date(game.startTimeUTC),
    gameTimezone: game.venueTimezone,
    homeTeam: {
      abbrev: homeTeam,
      eloBefore: homeEloBefore,
      eloAfter: homeEloAfter,
      score: game.homeTeam.score,
    },
    awayTeam: {
      abbrev: awayTeam,
      eloBefore: awayEloBefore,
      eloAfter: awayEloAfter,
      score: game.awayTeam.score,
    },
    eloChange: {
      homeTeam: homeEloChange,
      awayTeam: awayEloChange,
    },
    kFactor: adjustedK,
    homeAdvantage,
    expectedResult: {
      homeTeam: homeExpectedResult,
      awayTeam: awayExpectedResult,
    },
    actualResult: {
      homeTeam: homeActualResult,
      awayTeam: awayActualResult,
    },
    modelVersion: 'v1',
  }

  // Create prediction record
  const prediction = {
    gameId: game.id,
    homeTeam,
    awayTeam,
    predictedWinner: homeExpectedResult > 0.5 ? homeTeam : awayTeam,
    homeTeamWinProbability: homeExpectedResult,
    awayTeamWinProbability: awayExpectedResult,
    gameDate: new Date(game.startTimeUTC),
    modelVersion: 'v1',
  }

  // Update ELOs for next game
  const newElos = { ...currentElos }
  newElos[homeTeam] = homeEloAfter
  newElos[awayTeam] = awayEloAfter

  return {
    gameElo,
    prediction,
    newElos,
  }
}

/**
 * Calculate expected result based on ELO difference
 */
export function calculateExpectedResult(
  teamElo: number,
  opponentElo: number
): number {
  const ratingDiff = opponentElo - teamElo
  return 1 / (1 + Math.pow(10, ratingDiff / 400))
}

/**
 * Adjust K factor based on goal difference
 */
function adjustKFactor(baseK: number, goalDiff: number): number {
  if (goalDiff === 0) return baseK

  // Adjust K based on goal difference (blowout factor)
  const adjustedK = baseK * (1 + goalDiff * 0.1)
  return Math.min(adjustedK, 100) // Cap at 100
}

/**
 * Process all games for a season chronologically
 */
export async function processSeasonGames(
  season: Season,
  teams: Team[],
  initialElos: ELOsByTeam = {}
): Promise<{
  gameElos: GameELO[]
  predictions: Prediction[]
  finalElos: SeasonELO[]
}> {
  // Initialize ELOs for all teams
  const currentElos: ELOsByTeam = { ...initialElos }

  // Set initial ELOs for teams that don't have them
  teams.forEach((team) => {
    if (!(team.triCode in currentElos)) {
      currentElos[team.triCode] = INITIAL_ELO
    }
  })

  // Fetch all games for the season
  const allGames: NHLGame[] = []
  for (const team of teams) {
    const teamGames = await fetchGamesForTeam(team, season)
    allGames.push(...teamGames)
  }

  // Filter to regular season games and sort chronologically
  const regularSeasonGames = allGames
    .filter((game) => game.gameType === 2) // Regular season
    .filter((game) => game.gameState === 'OFF') // Completed games
    .sort(
      (a, b) =>
        new Date(a.startTimeUTC).getTime() - new Date(b.startTimeUTC).getTime()
    )

  // Remove duplicates based on game ID
  const uniqueGames = _.uniqBy(regularSeasonGames, 'id')

  console.log(`Processing ${uniqueGames.length} games for season ${season}`)

  const gameElos: GameELO[] = []
  const predictions: Prediction[] = []

  // Process each game chronologically
  for (const game of uniqueGames) {
    try {
      const result = await calculateGameELO(game, currentElos)

      gameElos.push(result.gameElo)
      predictions.push(result.prediction)

      // Update current ELOs for next game
      Object.assign(currentElos, result.newElos)

      // Log progress every 100 games
      if (gameElos.length % 100 === 0) {
        console.log(`Processed ${gameElos.length} games for season ${season}`)
      }
    } catch (error) {
      console.error(`Error processing game ${game.id}:`, error)
      continue
    }
  }

  // Convert final ELOs to SeasonELO format
  const finalElos: SeasonELO[] = Object.entries(currentElos).map(
    ([abbrev, elo]) => ({
      abbrev,
      elo,
      season: {
        startYear: parseInt(season.substring(0, 4)),
        endYear: parseInt(season.substring(4, 8)),
      },
    })
  )

  return {
    gameElos,
    predictions,
    finalElos,
  }
}

/**
 * Process multiple seasons with ELO progression
 */
export async function processMultipleSeasons(
  startSeason: number,
  endSeason: number,
  teams: Team[]
): Promise<void> {
  let currentElos: ELOsByTeam = {}

  for (let season = startSeason; season <= endSeason; season++) {
    const seasonStr = `${season}${season + 1}` as Season

    console.log(`\n=== Processing Season ${seasonStr} ===`)

    try {
      const result = await processSeasonGames(seasonStr, teams, currentElos)

      // Save game ELOs
      if (result.gameElos.length > 0) {
        await GameELOModel.insertMany(result.gameElos)
        console.log(`Saved ${result.gameElos.length} game ELO records`)
      }

      // Save predictions
      if (result.predictions.length > 0) {
        await PredictionModel.insertMany(result.predictions)
        console.log(`Saved ${result.predictions.length} predictions`)
      }

      // Save season ELOs
      if (result.finalElos.length > 0) {
        await SeasonELOModel.insertMany(result.finalElos)
        console.log(`Saved ${result.finalElos.length} season ELO records`)
      }

      // Update current ELOs for next season
      currentElos = result.finalElos.reduce((acc, elo) => {
        acc[elo.abbrev] = elo.elo
        return acc
      }, {} as ELOsByTeam)

      console.log(`Season ${seasonStr} completed. Final ELOs:`, currentElos)
    } catch (error) {
      console.error(`Error processing season ${seasonStr}:`, error)
      continue
    }
  }
}
