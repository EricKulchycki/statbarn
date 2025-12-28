'use server'

import { Database } from '@/lib/db'
import { UserPicksModel } from '@/models/userPicks'
import { GameELOModel } from '@/models/gameElo'
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

    // Validate that the game hasn't started yet
    const game = await GameELOModel.findOne({ gameId: data.gameId })
    if (!game) {
      throw new Error('Game not found')
    }

    const now = DateTime.now()
    const gameTime = DateTime.fromJSDate(game.gameDate)

    if (gameTime <= now) {
      throw new Error('Cannot make picks for games that have already started')
    }

    // Validate picked team
    if (data.pickedTeam !== data.homeTeam && data.pickedTeam !== data.awayTeam) {
      throw new Error('Picked team must be either home or away team')
    }

    // Find or create user picks document
    let userPicks = await UserPicksModel.findOne({ firebaseUid: data.firebaseUid })

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

    return { success: true, pick: userPicks.picks.find(p => p.gameId === data.gameId) }
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

    // Validate that the game hasn't started yet
    const game = await GameELOModel.findOne({ gameId })
    if (!game) {
      throw new Error('Game not found')
    }

    const now = DateTime.now()
    const gameTime = DateTime.fromJSDate(game.gameDate)

    if (gameTime <= now) {
      throw new Error('Cannot delete picks for games that have already started')
    }

    const userPicks = await UserPicksModel.findOne({ firebaseUid })
    if (!userPicks) {
      throw new Error('User picks not found')
    }

    // Remove the pick
    const pickIndex = userPicks.picks.findIndex(p => p.gameId === gameId)
    if (pickIndex === -1) {
      throw new Error('Pick not found')
    }

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
      picks = picks.filter(p => p.season === filters.season)
    }

    if (filters?.pending) {
      picks = picks.filter(p => p.isCorrect === undefined)
    }

    // Sort by game date descending
    picks.sort((a, b) => b.gameDate.getTime() - a.gameDate.getTime())

    if (filters?.limit) {
      picks = picks.slice(0, filters.limit)
    }

    return picks
  } catch (error) {
    console.error('Error getting user picks:', error)
    throw error
  }
}

/**
 * Get upcoming games available for picks (games happening in the next 24 hours)
 */
export async function getTomorrowsGames() {
  try {
    const db = Database.getInstance()
    await db.connect()

    const now = DateTime.now()
    const tomorrow = now.plus({ hours: 24 })

    const games = await GameELOModel.find({
      gameDate: {
        $gte: now.toJSDate(),
        $lte: tomorrow.toJSDate(),
      },
      gameType: 'regular',
    })
      .sort({ gameDate: 1 })
      .lean()

    return games.map(game => ({
      gameId: game.gameId,
      season: game.season,
      gameDate: game.gameDate.toISOString(),
      homeTeam: {
        abbrev: game.homeTeam.abbrev,
        eloBefore: game.homeTeam.eloBefore,
        score: game.homeTeam.score,
      },
      awayTeam: {
        abbrev: game.awayTeam.abbrev,
        eloBefore: game.awayTeam.eloBefore,
        score: game.awayTeam.score,
      },
      expectedResult: game.expectedResult,
    }))
  } catch (error) {
    console.error('Error getting tomorrows games:', error)
    throw error
  }
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
        seasonStats: [],
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
      seasonStats: userPicks.seasonStats,
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

    let query: any = {}

    // If season specified, filter by users who have picks in that season
    if (season) {
      query = {
        'seasonStats.season': season,
      }
    }

    const leaderboard = await UserPicksModel.find(query)
      .sort({ totalPoints: -1, accuracy: -1 })
      .limit(limit)
      .select('firebaseUid totalPicks correctPicks accuracy currentStreak totalPoints')
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
