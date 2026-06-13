import { GamePrediction } from '@/types/gamePrediction'
import { sum } from 'lodash'
import { EloService, eloService } from './elo.service'

export class ModelService {
  private static instance: ModelService

  private constructor(private readonly eloService: EloService) {}

  public static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService(eloService)
    }
    return ModelService.instance
  }

  getPredictionConfidence(game: GamePrediction): number {
    return Math.max(game.homeTeamWinProbability, game.awayTeamWinProbability)
  }

  async getAverageConfidence(season: number): Promise<number> {
    const games = await this.eloService.getAllGamePredictionsForSeason(season)
    const confidences = games.map((g) => this.getPredictionConfidence(g))
    return sum(confidences) / (confidences.length || 1)
  }

  async getConfidenceBuckets(
    season: number
  ): Promise<{ bucket: string; count: number }[]> {
    const games = await this.eloService.getAllGamePredictionsForSeason(season)
    const bucketRanges = [
      [0.5, 0.6],
      [0.6, 0.7],
      [0.7, 0.8],
      [0.8, 0.9],
      [0.9, 1.0],
    ]

    return bucketRanges.map(([min, max]) => ({
      bucket: `${(min * 100).toFixed(0)}-${(max * 100).toFixed(0)}%`,
      count: games.filter((g) => {
        const c = this.getPredictionConfidence(g)
        return c >= min && c < max
      }).length,
    }))
  }

  async getHighConfidenceUpsets(
    season: number,
    threshold = 0.8
  ): Promise<GamePrediction[]> {
    const games = await this.eloService.getAllGamePredictionsForSeason(season)
    return games.filter((g) => {
      if (!g.outcome) return false
      return (
        this.getPredictionConfidence(g) >= threshold &&
        !g.outcome.correctPrediction
      )
    })
  }

  async getMostConfidentTeam(season: number): Promise<string | null> {
    return this.getTeamByConfidence(season, 'highest')
  }

  async getLeastConfidentTeam(season: number): Promise<string | null> {
    return this.getTeamByConfidence(season, 'lowest')
  }

  private async getTeamByConfidence(
    season: number,
    direction: 'highest' | 'lowest'
  ): Promise<string | null> {
    const games = await this.eloService.getAllGamePredictionsForSeason(season)
    const teamConfidences: { [team: string]: number[] } = {}

    for (const game of games) {
      const predicted = game.predictedWinner
      if (!teamConfidences[predicted]) teamConfidences[predicted] = []
      teamConfidences[predicted].push(this.getPredictionConfidence(game))
    }

    let result: string | null = null
    let target = direction === 'highest' ? 0 : Infinity

    for (const team in teamConfidences) {
      const avg = sum(teamConfidences[team]) / teamConfidences[team].length
      if (
        (direction === 'highest' && avg > target) ||
        (direction === 'lowest' && avg < target)
      ) {
        target = avg
        result = team
      }
    }
    return result
  }

  async getModelConfidenceTrend(
    season: number
  ): Promise<{ date: string; avgConfidence: number }[]> {
    const games = await this.eloService.getAllGamePredictionsForSeason(season)
    const dateConfidences: { [date: string]: number[] } = {}

    for (const game of games) {
      const date = new Date(game.gameDate).toISOString().split('T')[0]
      if (!dateConfidences[date]) dateConfidences[date] = []
      dateConfidences[date].push(this.getPredictionConfidence(game))
    }

    return Object.entries(dateConfidences)
      .map(([date, values]) => ({
        date,
        avgConfidence: sum(values) / values.length,
      }))
      .sort((a, b) => (a.date < b.date ? -1 : 1))
  }
}

export const modelService = ModelService.getInstance()
