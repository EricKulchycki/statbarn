'use server'

import { Database } from '@/lib/db'
import { UserPicksModel } from '@/models/userPicks'
import { SeasonELOModel } from '@/models/elo'
import { getScheduleByDate } from '@/data/schedule'
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
    const now = DateTime.now()
    const gameTime = DateTime.fromJSDate(data.gameDate)

    if (gameTime <= now) {
      throw new Error('Cannot make picks for games that have already started')
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

    return {
      success: true,
      pick: userPicks.picks.find((p) => p.gameId === data.gameId),
    }
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

    return picks
  } catch (error) {
    console.error('Error getting user picks:', error)
    throw error
  }
}

/**
 * Get upcoming games available for picks (games happening in the next 48 hours)
 */
export async function getTomorrowsGames() {
  try {
    const db = Database.getInstance()
    await db.connect()

    const now = DateTime.now()
    const endTime = now.plus({ hours: 48 })

    // Fetch schedule from NHL API for today and tomorrow
    const today = now.toFormat('yyyy-MM-dd')
    const tomorrow = now.plus({ days: 1 }).toFormat('yyyy-MM-dd')
    const dayAfter = now.plus({ days: 2 }).toFormat('yyyy-MM-dd')

    const [todaySchedule, tomorrowSchedule, dayAfterSchedule] =
      await Promise.all([
        getScheduleByDate(today).catch(() => ({ gameWeek: [] })),
        getScheduleByDate(tomorrow).catch(() => ({ gameWeek: [] })),
        getScheduleByDate(dayAfter).catch(() => ({ gameWeek: [] })),
      ])

    // Combine all games from the schedules
    const allGameDays = [
      ...(todaySchedule.gameWeek || []),
      ...(tomorrowSchedule.gameWeek || []),
      ...(dayAfterSchedule.gameWeek || []),
    ]

    const allGames = allGameDays.flatMap((day) => day.games || [])

    // Filter games that are in the next 48 hours and are regular season
    const upcomingGames = allGames.filter((game) => {
      const gameTime = DateTime.fromISO(game.startTimeUTC)
      return (
        gameTime >= now &&
        gameTime <= endTime &&
        game.gameType === 2 && // Regular season
        game.gameState !== 'OFF' && // Not finished
        game.gameState !== 'FINAL' // Not final
      )
    })

    // Get current season ELO ratings for all teams
    // NHL season typically starts in October, so after October use current year, otherwise previous year
    const seasonStartYear = now.month >= 10 ? now.year : now.year - 1
    const eloRatings = await SeasonELOModel.find({
      'season.startYear': seasonStartYear,
    }).lean()

    const eloMap = new Map(eloRatings.map((e) => [e.abbrev, e.elo]))

    const HOME_ADVANTAGE = 25
    const INITIAL_ELO = 1500

    // Calculate expected results for each game
    return upcomingGames
      .map((game) => {
        const homeElo = eloMap.get(game.homeTeam.abbrev) || INITIAL_ELO
        const awayElo = eloMap.get(game.awayTeam.abbrev) || INITIAL_ELO

        // Calculate expected win probability
        const homeEloWithAdvantage = homeElo + HOME_ADVANTAGE
        const homeExpected =
          1 / (1 + Math.pow(10, (awayElo - homeEloWithAdvantage) / 400))
        const awayExpected = 1 - homeExpected

        return {
          gameId: game.id,
          season: game.season,
          gameDate: game.startTimeUTC,
          homeTeam: {
            abbrev: game.homeTeam.abbrev,
            logo: game.homeTeam.logo,
            eloBefore: homeElo,
            score: game.homeTeam.score || 0,
          },
          awayTeam: {
            abbrev: game.awayTeam.abbrev,
            logo: game.awayTeam.logo,
            eloBefore: awayElo,
            score: game.awayTeam.score || 0,
          },
          expectedResult: {
            homeTeam: homeExpected,
            awayTeam: awayExpected,
          },
        }
      })
      .sort(
        (a, b) =>
          new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime()
      )
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
