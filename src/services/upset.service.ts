import { getAllGamePredictionsForSeason } from '@/data/teams'
import { GamePrediction } from '@/types/gamePrediction'
import { Upset } from '@/types/upset'
import { getCurrentNHLSeason } from '@/utils/currentSeason'
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
    if (!asOf) return []

    const season = Number(getCurrentNHLSeason())
    const games = await getAllGamePredictionsForSeason(season)

    return this.toUpsets(
      games.filter((g) => g.outcome && DateTime.fromJSDate(g.gameDate) >= asOf)
    )
  }

  async getSeasonsUpsets(season: number): Promise<Upset[]> {
    const games = await getAllGamePredictionsForSeason(season)
    return this.toUpsets(games.filter((g) => g.outcome))
  }

  private toUpsets(games: GamePrediction[]): Upset[] {
    return games
      .filter((g) => g.outcome && !g.outcome.correctPrediction)
      .map((g) => ({
        gameId: g.gameId,
        date: DateTime.fromJSDate(g.gameDate),
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        predictedWinner: g.predictedWinner,
        actualWinner: g.outcome!.winner,
        homeScore: g.outcome!.homeScore,
        awayScore: g.outcome!.awayScore,
      }))
  }
}

export const upsetService = UpsetService.getInstance()
