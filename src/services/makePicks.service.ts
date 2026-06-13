import { getGamePredictionsForGameIds } from '@/data/teams'
import { UserPicksModel } from '@/models/userPicks'
import { scheduleService } from '@/services/schedule.service'
import { NHLGame } from '@/types/game'
import { DateTime } from 'luxon'

export interface MakePicksStats {
  gamesProcessed: number
  picksCreated: number
  picksUpdated: number
  errors: number
}

export class MakePicksService {
  private static instance: MakePicksService
  private readonly SYSTEM_USER_UID = 'system_statbarn'

  private constructor() {}

  public static getInstance(): MakePicksService {
    if (!MakePicksService.instance) {
      MakePicksService.instance = new MakePicksService()
    }
    return MakePicksService.instance
  }

  /**
   * Create picks for the system user based on AI predictions
   * for games happening in the next 24-48 hours
   */
  async makePicksForTomorrow(): Promise<MakePicksStats> {
    const stats: MakePicksStats = {
      gamesProcessed: 0,
      picksCreated: 0,
      picksUpdated: 0,
      errors: 0,
    }

    try {
      // Get tomorrow's date
      const tomorrow = DateTime.now().plus({ days: 1 }).toISODate()
      if (!tomorrow) {
        throw new Error("Failed to calculate tomorrow's date")
      }

      // Fetch games for tomorrow
      const gameWeek = await scheduleService.getScheduleByDate(tomorrow)
      const games = gameWeek.gameWeek[0]?.games || []

      // Filter for regular season games that haven't started
      const upcomingGames = this.filterUpcomingGames(games)

      // Get or create system user picks document
      let systemUserPicks = await UserPicksModel.findOne({
        firebaseUid: this.SYSTEM_USER_UID,
      })

      if (!systemUserPicks) {
        systemUserPicks = new UserPicksModel({
          firebaseUid: this.SYSTEM_USER_UID,
        })
      }

      // Process each game
      for (const game of upcomingGames) {
        try {
          const pickResult = await this.makePickForGame(game, systemUserPicks)

          if (pickResult === 'created') {
            stats.picksCreated++
          } else if (pickResult === 'updated') {
            stats.picksUpdated++
          }

          stats.gamesProcessed++
        } catch (error) {
          console.error(`Error making pick for game ${game.id}:`, error)
          stats.errors++
        }
      }

      // Save all picks
      await systemUserPicks.save()

      console.log('Make picks completed:', stats)
      return stats
    } catch (error) {
      console.error('Error in makePicksForTomorrow:', error)
      throw error
    }
  }

  /**
   * Filter for upcoming regular season games
   */
  private filterUpcomingGames(games: NHLGame[]): NHLGame[] {
    const now = DateTime.now()

    return games.filter((game) => {
      const gameTime = DateTime.fromISO(game.startTimeUTC)
      return (
        gameTime > now &&
        game.gameType === 2 && // Regular season
        game.gameState !== 'OFF' &&
        game.gameState !== 'FINAL'
      )
    })
  }

  /**
   * Make a pick for a single game based on AI prediction
   */
  private async makePickForGame(
    game: NHLGame,
    userPicks: InstanceType<typeof UserPicksModel>
  ): Promise<'created' | 'updated' | 'skipped'> {
    // Check if pick already exists for this game
    const existingPick = userPicks.picks.find((p) => p.gameId === game.id)

    // If pick exists and result is already determined, skip
    if (existingPick && existingPick.isCorrect !== undefined) {
      return 'skipped'
    }

    const predictions = await getGamePredictionsForGameIds([game.id])
    const prediction = predictions[0]

    const pickedTeam = prediction?.predictedWinner ?? game.homeTeam.abbrev

    if (!prediction) {
      console.warn(
        `No prediction found for game ${game.id}, defaulting to home team`
      )
    }

    userPicks.addPick({
      gameId: game.id,
      gameDate: new Date(game.startTimeUTC),
      season: game.season,
      pickedTeam,
      homeTeam: game.homeTeam.abbrev,
      awayTeam: game.awayTeam.abbrev,
      pickedAt: new Date(),
    })

    return existingPick ? 'updated' : 'created'
  }

  /**
   * Get the system user's picks (useful for displaying in UI)
   */
  async getSystemUserPicks() {
    return await UserPicksModel.findOne({
      firebaseUid: this.SYSTEM_USER_UID,
    })
  }

  /**
   * Get system user UID (for reference)
   */
  getSystemUserUid(): string {
    return this.SYSTEM_USER_UID
  }
}

export const makePicksService = MakePicksService.getInstance()
