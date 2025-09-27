import { sum } from 'lodash'
import { EloService, eloService } from './elo.service'
import { GameELO } from '@/models/gameElo'
import {
  getActualWinnerFromGameELO,
  getPredictedWinnerFromGameELO,
} from '@/utils/gameElo'

export class ModelService {
  private static instance: ModelService

  private constructor(private readonly eloService: EloService) {}

  public static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService(eloService)
    }
    return ModelService.instance
  }

  getPredictionConfidence(game: GameELO): number {
    const { expectedResult } = game
    return Math.max(expectedResult.homeTeam, expectedResult.awayTeam)
  }

  // Example: Get average model confidence for a season
  async getAverageConfidence(season: number): Promise<number> {
    const games = await this.eloService.getAllGameElosForSeason(season)

    const confidences: number[] = []
    for (const game of games) {
      const confidence = this.getPredictionConfidence(game)
      confidences.push(confidence)
    }
    return sum(confidences) / (confidences.length || 1)
  }

  async getConfidenceBuckets(
    season: number
  ): Promise<{ bucket: string; count: number }[]> {
    const games = await this.eloService.getAllGameElosForSeason(season)
    const buckets: { bucket: string; count: number }[] = []
    const bucketRanges = [
      [0.5, 0.6],
      [0.6, 0.7],
      [0.7, 0.8],
      [0.8, 0.9],
      [0.9, 1.0],
    ]

    for (const [min, max] of bucketRanges) {
      const count = games.filter((game) => {
        const confidence = this.getPredictionConfidence(game) / 100
        return confidence >= min && confidence < max
      }).length
      buckets.push({
        bucket: `${(min * 100).toFixed(0)}-${(max * 100).toFixed(0)}%`,
        count,
      })
    }
    return buckets
  }

  // Example: Get high-confidence upsets
  async getHighConfidenceUpsets(
    season: number,
    threshold: number = 0.8
  ): Promise<GameELO[]> {
    console.log('Fetching high-confidence upsets...')
    const seasonsGames = await this.eloService.getAllGameElosForSeason(season)
    // Fetch all games for the season and filter by confidence and upset
    // return games.filter(g => g.confidence >= threshold && g.predictionIncorrect)
    const highConfidenceUpsets: GameELO[] = seasonsGames.filter((game) => {
      const confidence = this.getPredictionConfidence(game)
      const predictedWinner = getPredictedWinnerFromGameELO(game)
      const actualWinner = getActualWinnerFromGameELO(game)
      return confidence >= threshold && predictedWinner !== actualWinner
    })
    return highConfidenceUpsets
  }

  async getMostConfidentTeam(season: number): Promise<string | null> {
    const seasonsGames = await this.eloService.getAllGameElosForSeason(season)
    const teamConfidences: { [team: string]: number[] } = {}

    for (const game of seasonsGames) {
      const confidence = this.getPredictionConfidence(game)
      const predictedWinner = getPredictedWinnerFromGameELO(game)
      if (!teamConfidences[predictedWinner]) {
        teamConfidences[predictedWinner] = []
      }
      teamConfidences[predictedWinner].push(confidence)
    }

    let mostConfidentTeam: string | null = null
    let highestAvgConfidence = 0

    for (const team in teamConfidences) {
      const avgConfidence =
        sum(teamConfidences[team]) / teamConfidences[team].length
      if (avgConfidence > highestAvgConfidence) {
        highestAvgConfidence = avgConfidence
        mostConfidentTeam = team
      }
    }

    return mostConfidentTeam
  }

  async getLeastConfidentTeam(season: number): Promise<string | null> {
    const seasonsGames = await this.eloService.getAllGameElosForSeason(season)
    const teamConfidences: { [team: string]: number[] } = {}

    for (const game of seasonsGames) {
      const confidence = this.getPredictionConfidence(game)
      const predictedWinner = getPredictedWinnerFromGameELO(game)
      if (!teamConfidences[predictedWinner]) {
        teamConfidences[predictedWinner] = []
      }
      teamConfidences[predictedWinner].push(confidence)
    }

    let leastConfidentTeam: string | null = null
    let lowestAvgConfidence = Infinity

    for (const team in teamConfidences) {
      const avgConfidence =
        sum(teamConfidences[team]) / teamConfidences[team].length
      if (avgConfidence < lowestAvgConfidence) {
        lowestAvgConfidence = avgConfidence
        leastConfidentTeam = team
      }
    }

    return leastConfidentTeam
  }

  async getModelConfidenceTrend(
    season: number
  ): Promise<{ date: string; avgConfidence: number }[]> {
    const seasonsGames = await this.eloService.getAllGameElosForSeason(season)
    const dateConfidences: { [date: string]: number[] } = {}

    for (const game of seasonsGames) {
      const confidence = this.getPredictionConfidence(game)
      const gameDate = game.gameDate.toISOString().split('T')[0] // YYYY-MM-DD
      if (!dateConfidences[gameDate]) {
        dateConfidences[gameDate] = []
      }
      dateConfidences[gameDate].push(confidence)
    }

    const trend: { date: string; avgConfidence: number }[] = []
    for (const date in dateConfidences) {
      const avgConfidence =
        sum(dateConfidences[date]) / dateConfidences[date].length
      trend.push({ date, avgConfidence })
    }

    // Sort by date ascending
    trend.sort((a, b) => (a.date < b.date ? -1 : 1))
    return trend
  }
}

// Export singleton instance
export const modelService = ModelService.getInstance()
