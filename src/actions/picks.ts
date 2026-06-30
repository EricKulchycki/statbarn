'use server'

import { Database } from '@/lib/db'
import { generateMockGames } from '@/lib/mock/picks'
import { TeamModel } from '@/models/team'
import { UserPicksModel } from '@/models/userPicks'
import { getCurrentNHLSeason } from '@/utils/currentSeason'
import { DateTime } from 'luxon'

export interface CreatePickData {
  firebaseUid: string
  gameId: number
  gameDate: Date
  season: number
  pickedTeam: string
  homeTeam: string
  awayTeam: string
  confidence?: number
}

export interface UpdatePickData {
  pickedTeam?: string
  confidence?: number
}

export interface PickFilters {
  season?: number
  pending?: boolean
  limit?: number
}

/**
 * Create or update a user's pick for a game
 */
export async function createPick(data: CreatePickData) {
  try {
    const db = Database.getInstance()
    await db.connect()

    if (DateTime.fromJSDate(data.gameDate) <= DateTime.now()) {
      throw new Error('Cannot pick a game that is already in progress')
    }

    // Validate picked team
    if (
      data.pickedTeam !== data.homeTeam &&
      data.pickedTeam !== data.awayTeam
    ) {
      throw new Error('Picked team must be either home or away team')
    }

    // Find or create user picks document
    let userPicks = await UserPicksModel.findOne({
      firebaseUid: data.firebaseUid,
    })

    if (!userPicks) {
      userPicks = new UserPicksModel({
        firebaseUid: data.firebaseUid,
      })
    }

    // Add the pick (will update if already exists)
    userPicks.addPick({
      gameId: data.gameId,
      gameDate: data.gameDate,
      season: data.season,
      pickedTeam: data.pickedTeam,
      pickedAt: new Date(),
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      confidence: data.confidence,
    })

    await userPicks.save()

    return { success: true }
  } catch (error) {
    console.error('Error creating pick:', error)
    throw error
  }
}

/**
 * Delete a user's pick for a game
 */
export async function deletePick(firebaseUid: string, gameId: number) {
  try {
    const db = Database.getInstance()
    await db.connect()

    const userPicks = await UserPicksModel.findOne({ firebaseUid })
    if (!userPicks) {
      throw new Error('User picks not found')
    }

    // Find the pick
    const pickIndex = userPicks.picks.findIndex((p) => p.gameId === gameId)
    if (pickIndex === -1) {
      throw new Error('Pick not found')
    }

    // Validate that the game hasn't started yet using the pick's game date
    const now = DateTime.now()
    const gameTime = DateTime.fromJSDate(userPicks.picks[pickIndex].gameDate)

    if (gameTime <= now) {
      throw new Error('Cannot delete picks for games that have already started')
    }

    // Remove the pick
    userPicks.picks.splice(pickIndex, 1)
    userPicks.totalPicks = Math.max(0, userPicks.totalPicks - 1)

    await userPicks.save()

    return { success: true }
  } catch (error) {
    console.error('Error deleting pick:', error)
    throw error
  }
}

/**
 * Get a user's picks with optional filters
 */
export async function getUserPicks(firebaseUid: string, filters?: PickFilters) {
  try {
    const db = Database.getInstance()
    await db.connect()

    const userPicks = await UserPicksModel.findOne({ firebaseUid })
    if (!userPicks) {
      return []
    }

    let picks = [...userPicks.picks]

    // Apply filters
    if (filters?.season) {
      picks = picks.filter((p) => p.season === filters.season)
    }

    if (filters?.pending) {
      picks = picks.filter((p) => p.isCorrect === undefined)
    }

    // Sort by game date descending
    picks.sort((a, b) => b.gameDate.getTime() - a.gameDate.getTime())

    if (filters?.limit) {
      picks = picks.slice(0, filters.limit)
    }

    return picks.map((p) => ({
      gameId: p.gameId,
      pickedTeam: p.pickedTeam,
    }))
  } catch (error) {
    console.error('Error getting user picks:', error)
    throw error
  }
}

/**
 * Get upcoming games available for picks — next 7 days from the team documents.
 * Games are sourced from stored season data (prediction set, no outcome yet),
 * so no NHL API calls are needed.
 */
export async function getTomorrowsGames() {
  if (process.env.USE_MOCK_GAMES === 'true') {
    return generateMockGames()
  }

  const db = Database.getInstance()
  await db.connect()

  const now = DateTime.now()
  const startOfToday = now.startOf('day')
  const weekFromNow = startOfToday.plus({ days: 7 })
  const season = Number(getCurrentNHLSeason())

  const records = await TeamModel.aggregate([
    { $unwind: '$seasons' },
    { $match: { 'seasons.season': season } },
    { $unwind: '$seasons.games' },
    {
      $match: {
        'seasons.games.isHome': true,
        'seasons.games.outcome': { $exists: false },
        'seasons.games.prediction': { $exists: true },
        'seasons.games.gameDate': {
          $gte: startOfToday.toJSDate(),
          $lte: weekFromNow.toJSDate(),
        },
      },
    },
    {
      $project: {
        homeAbbrev: '$triCode',
        homeLogo: '$logo',
        homeElo: '$seasons.games.eloBefore',
        season: '$seasons.season',
        gameId: '$seasons.games.gameId',
        gameDate: '$seasons.games.gameDate',
        opponent: '$seasons.games.opponent',
        winProbability: '$seasons.games.prediction.winProbability',
      },
    },
    { $sort: { gameDate: 1 } },
  ])

  const allTeams = await TeamModel.find(
    {},
    { triCode: 1, logo: 1, currentElo: 1 }
  ).lean()
  const teamMap = new Map(allTeams.map((t) => [t.triCode, t]))

  return records.map((r) => {
    const away = teamMap.get(r.opponent)
    const homeWinProb: number = r.winProbability ?? 0.5
    const nhleLogoUrl = (abbrev: string) =>
      `https://assets.nhle.com/logos/nhl/svg/${abbrev}_light.svg`

    return {
      gameId: r.gameId as number,
      season: r.season as number,
      gameDate: (r.gameDate as Date).toISOString(),
      homeTeam: {
        abbrev: r.homeAbbrev as string,
        logo: (r.homeLogo as string | undefined) ?? nhleLogoUrl(r.homeAbbrev),
        eloBefore: r.homeElo as number,
        score: 0,
      },
      awayTeam: {
        abbrev: r.opponent as string,
        logo: away?.logo ?? nhleLogoUrl(r.opponent),
        eloBefore: away?.currentElo ?? 1500,
        score: 0,
      },
      expectedResult: {
        homeTeam: homeWinProb,
        awayTeam: 1 - homeWinProb,
      },
    }
  })
}

/**
 * Get user's overall stats
 */
export async function getUserStats(firebaseUid: string) {
  try {
    const db = Database.getInstance()
    await db.connect()

    const userPicks = await UserPicksModel.findOne({ firebaseUid })
    if (!userPicks) {
      return {
        totalPicks: 0,
        correctPicks: 0,
        accuracy: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        rank: undefined,
        beatStatbarnCount: 0,
      }
    }

    return {
      totalPicks: userPicks.totalPicks,
      correctPicks: userPicks.correctPicks,
      accuracy: userPicks.accuracy,
      currentStreak: userPicks.currentStreak,
      longestStreak: userPicks.longestStreak,
      totalPoints: userPicks.totalPoints,
      rank: userPicks.rank,
      beatStatbarnCount: userPicks.beatStatbarnCount,
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    throw error
  }
}

/**
 * Get leaderboard of top predictors
 */
export async function getLeaderboard(limit: number = 10, season?: number) {
  try {
    const db = Database.getInstance()
    await db.connect()

    let query = {}

    // If season specified, filter by users who have picks in that season
    if (season) {
      query = {
        'seasonStats.season': season,
      }
    }

    const leaderboard = await UserPicksModel.find(query)
      .sort({ totalPoints: -1, accuracy: -1 })
      .limit(limit)
      .select(
        'firebaseUid totalPicks correctPicks accuracy currentStreak totalPoints'
      )
      .lean()

    return leaderboard.map((user, index) => ({
      rank: index + 1,
      firebaseUid: user.firebaseUid,
      totalPicks: user.totalPicks,
      correctPicks: user.correctPicks,
      accuracy: user.accuracy,
      currentStreak: user.currentStreak,
      totalPoints: user.totalPoints,
    }))
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    throw error
  }
}
