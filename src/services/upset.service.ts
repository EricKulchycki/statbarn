import { GameType } from '@/constants'
import { GameELOModel } from '@/models/gameElo'
import { Upset } from '@/types/upset'
import {
  getActualWinnerFromGameELO,
  getPredictedWinnerFromGameELO,
} from '@/utils/gameElo'
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
    if (!asOf) {
      return []
    }

    // Find all games with a clear predicted winner
    const games = await GameELOModel.find({
      gameType: GameType.REGULAR,
      gameDate: { $gte: asOf?.toISO() },
    })
      .sort({ gameDate: -1 })
      .exec()

    const upsets: Upset[] = []
    for (const game of games) {
      // Determine predicted winner
      const predictedWinner = getPredictedWinnerFromGameELO(game)
      // Determine actual winner
      const actualWinner = getActualWinnerFromGameELO(game)
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
      const predictedWinner = getPredictedWinnerFromGameELO(game)
      const actualWinner = getActualWinnerFromGameELO(game)
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
