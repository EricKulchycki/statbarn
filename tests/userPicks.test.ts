import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { UserPicksModel } from '../src/models/userPicks'
import { Database } from '../src/lib/db'

describe('UserPicks Model', () => {
  const db = Database.getInstance()

  beforeEach(async () => {
    await db.connect()
    // Clean up test data
    await UserPicksModel.deleteMany({
      firebaseUid: { $regex: /^test-/ },
    })
  })

  afterEach(async () => {
    // Clean up after tests
    await UserPicksModel.deleteMany({
      firebaseUid: { $regex: /^test-/ },
    })
  })

  describe('Model Creation', () => {
    it('should create a new user picks document with default values', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-1',
      })

      expect(userPicks.firebaseUid).toBe('test-user-1')
      expect(userPicks.totalPicks).toBe(0)
      expect(userPicks.correctPicks).toBe(0)
      expect(userPicks.accuracy).toBe(0)
      expect(userPicks.currentStreak).toBe(0)
      expect(userPicks.longestStreak).toBe(0)
      expect(userPicks.totalPoints).toBe(0)
      expect(userPicks.beatStatbarnCount).toBe(0)
      expect(userPicks.picks).toHaveLength(0)
      expect(userPicks.seasonStats).toHaveLength(0)
    })

    it('should enforce unique firebaseUid constraint', async () => {
      await UserPicksModel.create({ firebaseUid: 'test-user-2' })

      await expect(
        UserPicksModel.create({ firebaseUid: 'test-user-2' })
      ).rejects.toThrow()
    })
  })

  describe('addPick method', () => {
    it('should add a new pick to the picks array', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-3',
      })

      userPicks.addPick({
        gameId: 2025020501,
        gameDate: new Date('2025-01-15'),
        season: 20252026,
        pickedTeam: 'TOR',
        homeTeam: 'TOR',
        awayTeam: 'BOS',
        confidence: 4,
      })

      await userPicks.save()

      expect(userPicks.picks).toHaveLength(1)
      expect(userPicks.totalPicks).toBe(1)
      expect(userPicks.picks[0].gameId).toBe(2025020501)
      expect(userPicks.picks[0].pickedTeam).toBe('TOR')
      expect(userPicks.picks[0].confidence).toBe(4)
    })

    it('should update existing pick instead of duplicating', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-4',
      })

      // Add initial pick
      userPicks.addPick({
        gameId: 2025020502,
        gameDate: new Date('2025-01-15'),
        season: 20252026,
        pickedTeam: 'TOR',
        homeTeam: 'TOR',
        awayTeam: 'BOS',
        confidence: 3,
      })

      await userPicks.save()

      // Update same game
      userPicks.addPick({
        gameId: 2025020502,
        gameDate: new Date('2025-01-15'),
        season: 20252026,
        pickedTeam: 'BOS', // Changed pick
        homeTeam: 'TOR',
        awayTeam: 'BOS',
        confidence: 5, // Changed confidence
      })

      await userPicks.save()

      expect(userPicks.picks).toHaveLength(1)
      expect(userPicks.totalPicks).toBe(1) // Should not increment
      expect(userPicks.picks[0].pickedTeam).toBe('BOS')
      expect(userPicks.picks[0].confidence).toBe(5)
    })

    it('should handle multiple picks for different games', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-5',
      })

      userPicks.addPick({
        gameId: 2025020503,
        gameDate: new Date('2025-01-15'),
        season: 20252026,
        pickedTeam: 'TOR',
        homeTeam: 'TOR',
        awayTeam: 'BOS',
      })

      userPicks.addPick({
        gameId: 2025020504,
        gameDate: new Date('2025-01-15'),
        season: 20252026,
        pickedTeam: 'EDM',
        homeTeam: 'EDM',
        awayTeam: 'CGY',
      })

      userPicks.addPick({
        gameId: 2025020505,
        gameDate: new Date('2025-01-15'),
        season: 20252026,
        pickedTeam: 'VGK',
        homeTeam: 'VGK',
        awayTeam: 'COL',
      })

      await userPicks.save()

      expect(userPicks.picks).toHaveLength(3)
      expect(userPicks.totalPicks).toBe(3)
    })
  })

  describe('updatePickResult method', () => {
    it('should update pick result when user picks correctly', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-6',
      })

      userPicks.addPick({
        gameId: 2025020506,
        gameDate: new Date('2025-01-15'),
        season: 20252026,
        pickedTeam: 'TOR',
        homeTeam: 'TOR',
        awayTeam: 'BOS',
      })

      await userPicks.save()

      // TOR wins - correct pick
      userPicks.updatePickResult(2025020506, 'TOR', 1)
      await userPicks.save()

      expect(userPicks.picks[0].isCorrect).toBe(true)
      expect(userPicks.picks[0].actualWinner).toBe('TOR')
      expect(userPicks.picks[0].points).toBe(1)
      expect(userPicks.correctPicks).toBe(1)
      expect(userPicks.totalPoints).toBe(1)
      expect(userPicks.accuracy).toBe(100)
      expect(userPicks.currentStreak).toBe(1)
      expect(userPicks.longestStreak).toBe(1)
    })

    it('should update pick result when user picks incorrectly', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-7',
      })

      userPicks.addPick({
        gameId: 2025020507,
        gameDate: new Date('2025-01-15'),
        season: 20252026,
        pickedTeam: 'TOR',
        homeTeam: 'TOR',
        awayTeam: 'BOS',
      })

      await userPicks.save()

      // BOS wins - incorrect pick
      userPicks.updatePickResult(2025020507, 'BOS', 0)
      await userPicks.save()

      expect(userPicks.picks[0].isCorrect).toBe(false)
      expect(userPicks.picks[0].actualWinner).toBe('BOS')
      expect(userPicks.picks[0].points).toBe(0)
      expect(userPicks.correctPicks).toBe(0)
      expect(userPicks.totalPoints).toBe(0)
      expect(userPicks.accuracy).toBe(0)
      expect(userPicks.currentStreak).toBe(0)
    })

    it('should track winning streak correctly', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-8',
      })

      // Add 3 picks
      for (let i = 1; i <= 3; i++) {
        userPicks.addPick({
          gameId: 2025020508 + i,
          gameDate: new Date('2025-01-15'),
          season: 20252026,
          pickedTeam: 'TOR',
          homeTeam: 'TOR',
          awayTeam: 'BOS',
        })
      }

      await userPicks.save()

      // Win first game
      userPicks.updatePickResult(2025020509, 'TOR', 1)
      expect(userPicks.currentStreak).toBe(1)

      // Win second game
      userPicks.updatePickResult(2025020510, 'TOR', 1)
      expect(userPicks.currentStreak).toBe(2)
      expect(userPicks.longestStreak).toBe(2)

      // Win third game
      userPicks.updatePickResult(2025020511, 'TOR', 1)
      expect(userPicks.currentStreak).toBe(3)
      expect(userPicks.longestStreak).toBe(3)

      await userPicks.save()
    })

    it('should reset current streak on loss but keep longest streak', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-9',
      })

      // Add 4 picks
      for (let i = 1; i <= 4; i++) {
        userPicks.addPick({
          gameId: 2025020512 + i,
          gameDate: new Date('2025-01-15'),
          season: 20252026,
          pickedTeam: 'TOR',
          homeTeam: 'TOR',
          awayTeam: 'BOS',
        })
      }

      await userPicks.save()

      // Win 3 games in a row
      userPicks.updatePickResult(2025020513, 'TOR', 1)
      userPicks.updatePickResult(2025020514, 'TOR', 1)
      userPicks.updatePickResult(2025020515, 'TOR', 1)

      expect(userPicks.currentStreak).toBe(3)
      expect(userPicks.longestStreak).toBe(3)

      // Lose one game
      userPicks.updatePickResult(2025020516, 'BOS', 0)

      expect(userPicks.currentStreak).toBe(0) // Reset
      expect(userPicks.longestStreak).toBe(3) // Preserved
      expect(userPicks.correctPicks).toBe(3)
      expect(userPicks.accuracy).toBe(75)

      await userPicks.save()
    })

    it('should update season stats correctly', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-10',
      })

      userPicks.addPick({
        gameId: 2025020517,
        gameDate: new Date('2025-01-15'),
        season: 20252026,
        pickedTeam: 'TOR',
        homeTeam: 'TOR',
        awayTeam: 'BOS',
      })

      await userPicks.save()

      userPicks.updatePickResult(2025020517, 'TOR', 2) // 2 points for upset
      await userPicks.save()

      expect(userPicks.seasonStats).toHaveLength(1)
      expect(userPicks.seasonStats[0].season).toBe(20252026)
      expect(userPicks.seasonStats[0].picks).toBe(1)
      expect(userPicks.seasonStats[0].correct).toBe(1)
      expect(userPicks.seasonStats[0].accuracy).toBe(100)
      expect(userPicks.seasonStats[0].points).toBe(2)
    })

    it('should throw error when updating non-existent pick', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-11',
      })

      expect(() => {
        userPicks.updatePickResult(9999999, 'TOR', 1)
      }).toThrow('Pick not found for game 9999999')
    })
  })

  describe('getPendingPicks method', () => {
    it('should return only picks without results', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-12',
      })

      // Add 3 picks
      for (let i = 1; i <= 3; i++) {
        userPicks.addPick({
          gameId: 2025020518 + i,
          gameDate: new Date('2025-01-15'),
          season: 20252026,
          pickedTeam: 'TOR',
          homeTeam: 'TOR',
          awayTeam: 'BOS',
        })
      }

      await userPicks.save()

      // Process result for first pick only
      userPicks.updatePickResult(2025020519, 'TOR', 1)
      await userPicks.save()

      const pending = userPicks.getPendingPicks()

      expect(pending).toHaveLength(2)
      expect(pending[0].gameId).toBe(2025020520)
      expect(pending[1].gameId).toBe(2025020521)
    })

    it('should return empty array when all picks have results', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-13',
      })

      userPicks.addPick({
        gameId: 2025020522,
        gameDate: new Date('2025-01-15'),
        season: 20252026,
        pickedTeam: 'TOR',
        homeTeam: 'TOR',
        awayTeam: 'BOS',
      })

      await userPicks.save()

      userPicks.updatePickResult(2025020522, 'TOR', 1)
      await userPicks.save()

      const pending = userPicks.getPendingPicks()
      expect(pending).toHaveLength(0)
    })
  })

  describe('getRecentPicks method', () => {
    it('should return picks sorted by date (most recent first)', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-14',
      })

      // Add picks with different dates
      userPicks.addPick({
        gameId: 2025020523,
        gameDate: new Date('2025-01-13'),
        season: 20252026,
        pickedTeam: 'TOR',
        homeTeam: 'TOR',
        awayTeam: 'BOS',
      })

      userPicks.addPick({
        gameId: 2025020524,
        gameDate: new Date('2025-01-15'),
        season: 20252026,
        pickedTeam: 'EDM',
        homeTeam: 'EDM',
        awayTeam: 'CGY',
      })

      userPicks.addPick({
        gameId: 2025020525,
        gameDate: new Date('2025-01-14'),
        season: 20252026,
        pickedTeam: 'VGK',
        homeTeam: 'VGK',
        awayTeam: 'COL',
      })

      await userPicks.save()

      const recent = userPicks.getRecentPicks()

      expect(recent).toHaveLength(3)
      expect(recent[0].gameId).toBe(2025020524) // Jan 15
      expect(recent[1].gameId).toBe(2025020525) // Jan 14
      expect(recent[2].gameId).toBe(2025020523) // Jan 13
    })

    it('should respect limit parameter', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-15',
      })

      // Add 5 picks
      for (let i = 1; i <= 5; i++) {
        userPicks.addPick({
          gameId: 2025020526 + i,
          gameDate: new Date(`2025-01-${10 + i}`),
          season: 20252026,
          pickedTeam: 'TOR',
          homeTeam: 'TOR',
          awayTeam: 'BOS',
        })
      }

      await userPicks.save()

      const recent = userPicks.getRecentPicks(3)
      expect(recent).toHaveLength(3)
    })
  })

  describe('Complex scenarios', () => {
    it('should handle multiple seasons correctly', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-16',
      })

      // Add pick from season 2024-2025
      userPicks.addPick({
        gameId: 2024020501,
        gameDate: new Date('2024-12-15'),
        season: 20242025,
        pickedTeam: 'TOR',
        homeTeam: 'TOR',
        awayTeam: 'BOS',
      })

      userPicks.updatePickResult(2024020501, 'TOR', 1)

      // Add pick from season 2025-2026
      userPicks.addPick({
        gameId: 2025020532,
        gameDate: new Date('2025-01-15'),
        season: 20252026,
        pickedTeam: 'EDM',
        homeTeam: 'EDM',
        awayTeam: 'CGY',
      })

      userPicks.updatePickResult(2025020532, 'EDM', 1)

      await userPicks.save()

      expect(userPicks.seasonStats).toHaveLength(2)
      expect(userPicks.seasonStats[0].season).toBe(20242025)
      expect(userPicks.seasonStats[1].season).toBe(20252026)
    })

    it('should calculate accuracy correctly with mixed results', async () => {
      const userPicks = await UserPicksModel.create({
        firebaseUid: 'test-user-17',
      })

      // Add 10 picks
      for (let i = 1; i <= 10; i++) {
        userPicks.addPick({
          gameId: 2025020533 + i,
          gameDate: new Date('2025-01-15'),
          season: 20252026,
          pickedTeam: 'TOR',
          homeTeam: 'TOR',
          awayTeam: 'BOS',
        })
      }

      await userPicks.save()

      // Win 7, lose 3
      for (let i = 1; i <= 7; i++) {
        userPicks.updatePickResult(2025020533 + i, 'TOR', 1)
      }

      for (let i = 8; i <= 10; i++) {
        userPicks.updatePickResult(2025020533 + i, 'BOS', 0)
      }

      await userPicks.save()

      expect(userPicks.correctPicks).toBe(7)
      expect(userPicks.totalPicks).toBe(10)
      expect(userPicks.accuracy).toBe(70)
    })
  })
})
