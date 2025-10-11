import { GameType } from '@/constants'
import { GameELOModel } from '@/models/gameElo'
import { Upset } from '@/types/upset'
import { DateTime } from 'luxon'

export class UpsetService {
  private static instance: UpsetService

  private constructor() {}

  public static getInstance(): UpsetService {
    if (!UpsetService.instance) {
      UpsetService.instance = new UpsetService()
    }
    return UpsetService.instance
  }

  async getAllUpsets(asOf?: DateTime): Promise<Upset[]> {
    // Find all games with a clear predicted winner
    const games = await GameELOModel.find({
      gameDate: { $gte: asOf?.toISO() },
      gameType: GameType.REGULAR,
    })
      .sort({ gameDate: -1 })
      .lean()
      .exec()

    const upsets: Upset[] = []
    for (const game of games) {
      // Determine predicted winner
      const predictedWinner =
        game.expectedResult.homeTeam > game.expectedResult.awayTeam
          ? game.homeTeam.abbrev
          : game.awayTeam.abbrev
      // Determine actual winner
      const actualWinner =
        game.homeTeam.score > game.awayTeam.score
          ? game.homeTeam.abbrev
          : game.awayTeam.abbrev
      // If predicted winner lost, it's an upset
      if (predictedWinner !== actualWinner) {
        upsets.push({
          gameId: game.gameId,
          date: DateTime.fromJSDate(game.gameDate),
          homeTeam: game.homeTeam.abbrev,
          awayTeam: game.awayTeam.abbrev,
          predictedWinner,
          actualWinner,
          homeScore: game.homeTeam.score,
          awayScore: game.awayTeam.score,
        })
      }
    }
    return upsets
  }

  async getSeasonsUpsets(season: number): Promise<Upset[]> {
    const games = await GameELOModel.find({
      season,
      gameType: GameType.REGULAR,
    })
      .sort({ gameDate: -1 })
      .lean()
      .exec()

    const upsets: Upset[] = []
    for (const game of games) {
      const predictedWinner =
        game.expectedResult.homeTeam > game.expectedResult.awayTeam
          ? game.homeTeam.abbrev
          : game.awayTeam.abbrev
      const actualWinner =
        game.homeTeam.score > game.awayTeam.score
          ? game.homeTeam.abbrev
          : game.awayTeam.abbrev
      if (predictedWinner !== actualWinner) {
        upsets.push({
          gameId: game.gameId,
          date: DateTime.fromJSDate(game.gameDate),
          homeTeam: game.homeTeam.abbrev,
          awayTeam: game.awayTeam.abbrev,
          predictedWinner,
          actualWinner,
          homeScore: game.homeTeam.score,
          awayScore: game.awayTeam.score,
        })
      }
    }
    return upsets
  }
}

export const upsetService = UpsetService.getInstance()
