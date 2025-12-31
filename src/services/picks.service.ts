import { Pick, UserPicksModel } from '@/models/userPicks'
import { PredictionModel } from '@/models/prediction'
import { scheduleService } from '@/services/schedule.service'
import { DateTime } from 'luxon'
import { NHLGame } from '@/types/game'

export interface ProcessResultsStats {
  gamesProcessed: number
  picksProcessed: number
  usersProcessed: number
  beatStatbarnCount: number
}

export class PicksService {
  private static instance: PicksService

  private constructor() {}

  public static getInstance(): PicksService {
    if (!PicksService.instance) {
      PicksService.instance = new PicksService()
    }
    return PicksService.instance
  }

  /**
   * Process completed games from a specific date and update user picks
   */
  async processPickResults(date: DateTime): Promise<ProcessResultsStats> {
    // Fetch games from the NHL API
    const currentDate = date.toISODate()
    if (!currentDate) {
      throw new Error('FUCKING NO DATE AVAILABLE THERE BUD')
    }
    const gameWeek = await scheduleService.getScheduleByDate(currentDate)
    const games = gameWeek.gameWeek[0]?.games || []

    // Filter for completed regular season games
    const completedGames = this.filterCompletedGames(games)

    let processedPicks = 0
    let processedUsers = 0
    let beatStatbarnCount = 0

    // Process each completed game
    for (const game of completedGames) {
      const result = await this.processGamePicks(game)
      processedPicks += result.picksProcessed
      processedUsers += result.usersProcessed
      beatStatbarnCount += result.beatStatbarnCount
    }

    return {
      gamesProcessed: completedGames.length,
      picksProcessed: processedPicks,
      usersProcessed: processedUsers,
      beatStatbarnCount,
    }
  }

  /**
   * Filter for completed regular season games
   */
  private filterCompletedGames(games: NHLGame[]): NHLGame[] {
    return games.filter(
      (game) =>
        game.gameType === 2 && // Regular season
        (game.gameState === 'OFF' || game.gameState === 'FINAL') && // Game finished
        game.homeTeam.score !== game.awayTeam.score // Not a tie
    )
  }

  /**
   * Process all picks for a single game
   */
  private async processGamePicks(game: NHLGame): Promise<{
    picksProcessed: number
    usersProcessed: number
    beatStatbarnCount: number
  }> {
    // Determine the winner
    const actualWinner =
      game.homeTeam.score > game.awayTeam.score
        ? game.homeTeam.abbrev
        : game.awayTeam.abbrev

    // Get Statbarn prediction for comparison
    const { statbarnPredictedWinner, isUpset } =
      await this.getStatbarnPrediction(game.id, actualWinner)

    // Find all users with pending picks for this game
    const usersWithPicks = await UserPicksModel.find({
      'picks.gameId': game.id,
      'picks.isCorrect': { $exists: false },
    })

    let picksProcessed = 0
    let beatStatbarnCount = 0

    // Process each user's pick
    for (const userPicks of usersWithPicks) {
      const pick = userPicks.picks.find(
        (p) => p.gameId === game.id && p.isCorrect === undefined
      )

      if (!pick) continue

      // Calculate points
      const points = this.calculatePoints(
        pick,
        actualWinner,
        isUpset,
        statbarnPredictedWinner,
        userPicks.currentStreak
      )

      // Track if user beat Statbarn
      const didBeatStatbarn =
        pick.pickedTeam === actualWinner &&
        statbarnPredictedWinner &&
        pick.pickedTeam !== statbarnPredictedWinner

      if (didBeatStatbarn) {
        userPicks.beatStatbarnCount += 1
        beatStatbarnCount++
      }

      // Update the pick result
      userPicks.updatePickResult(game.id, actualWinner, points)
      await userPicks.save()

      picksProcessed++
    }

    return {
      picksProcessed,
      usersProcessed: usersWithPicks.length,
      beatStatbarnCount,
    }
  }

  /**
   * Get Statbarn prediction and determine if result was an upset
   */
  private async getStatbarnPrediction(
    gameId: number,
    actualWinner: string
  ): Promise<{
    statbarnPredictedWinner: string | null
    isUpset: boolean
  }> {
    const statbarnPrediction = await PredictionModel.findOne({ gameId })

    if (!statbarnPrediction) {
      return {
        statbarnPredictedWinner: null,
        isUpset: false,
      }
    }

    const statbarnPredictedWinner = statbarnPrediction.predictedWinner
    const isUpset = actualWinner !== statbarnPredictedWinner

    return {
      statbarnPredictedWinner,
      isUpset,
    }
  }

  /**
   * Calculate points for a pick based on multiple factors
   */
  private calculatePoints(
    pick: Pick,
    actualWinner: string,
    isUpset: boolean,
    statbarnPredictedWinner: string | null,
    currentStreak: number
  ): number {
    const isCorrect = pick.pickedTeam === actualWinner

    if (!isCorrect) {
      return 0
    }

    let points = 1 // Base point for correct pick

    // Upset bonus: +1 point if underdog won
    if (isUpset) {
      points += 1
    }

    // Confidence bonus: +1 if max confidence (legacy feature)
    if (pick.confidence === 5) {
      points += 1
    }

    // Streak bonuses
    if (currentStreak >= 20) {
      points += 3
    } else if (currentStreak >= 10) {
      points += 2
    } else if (currentStreak >= 5) {
      points += 1
    }

    // Beat Statbarn bonus: +2 points if user correct and Statbarn was wrong
    if (
      statbarnPredictedWinner &&
      pick.pickedTeam !== statbarnPredictedWinner
    ) {
      points += 2
    }

    return points
  }

  /**
   * Process yesterday's picks (convenience method for cron jobs)
   */
  async processYesterdaysPicks(): Promise<ProcessResultsStats> {
    const yesterday = DateTime.now().minus({ days: 1 }).startOf('day')
    return this.processPickResults(yesterday)
  }
}

export const picksService = PicksService.getInstance()
