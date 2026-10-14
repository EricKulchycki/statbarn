import {
  getGamePredictionsForGameIds,
  saveTeamSeasonPredictions,
} from '@/data/teams'
import { ELOsByTeam } from '@/lib/eloCalculator'
import { selectGamesToPredict } from '@/lib/predictionWindow'
import { NHLGame, NHLGameWeek } from '@/types/game'
import { GamePrediction } from '@/types/gamePrediction'
import { ModelSnapshot } from '@/types/modelVersion'
import { eloService } from './elo.service'
import { getActiveModel } from './modelVersion.service'
import { predictorService } from './predictor.service'
import { scheduleService } from './schedule.service'

export class PredictionsService {
  private static instance: PredictionsService

  private constructor() {}

  public static getInstance(): PredictionsService {
    if (!PredictionsService.instance) {
      PredictionsService.instance = new PredictionsService()
    }
    return PredictionsService.instance
  }

  async getUpcomingGamePredictions(
    scheduleData: NHLGameWeek
  ): Promise<GamePrediction[]> {
    const gameIds: number[] = []
    for (const day of scheduleData.gameWeek) {
      for (const game of day.games) {
        gameIds.push(game.id)
      }
    }
    if (gameIds.length === 0) return []
    return getGamePredictionsForGameIds(gameIds)
  }

  // Predicts every unstarted game in the window, re-predicting ones already
  // stored so each night's ratings and active model replace older forecasts
  async createUpcomingPredictions(): Promise<{
    days: number
    games: number
  }> {
    // Runs at 06:30 UTC, when the UTC date is tonight's North American slate
    const today = new Date().toISOString().slice(0, 10)

    const [schedule, latestElos, model] = await Promise.all([
      scheduleService.getScheduleByDate(today),
      eloService.getLatestElos(),
      getActiveModel(),
    ])
    const eloMap = Object.fromEntries(latestElos.map((e) => [e.abbrev, e.elo]))
    const days = selectGamesToPredict(schedule.gameWeek, today)

    // One day at a time: each day saves to the same team documents
    for (const day of days) {
      await this.predictGames(day.games, day.date, eloMap, model)
    }

    return {
      days: days.length,
      games: days.reduce((n, d) => n + d.games.length, 0),
    }
  }

  async predictGames(
    games: NHLGame[],
    scheduleDate: string,
    currentElos: ELOsByTeam,
    model: ModelSnapshot
  ): Promise<void> {
    const { version: modelVersion, params } = model
    const byHomeTeam = new Map<
      string,
      Array<{
        gameId: number
        gameDate: Date
        scheduleDate: string
        opponent: string
        isHome: boolean
        eloBefore: number
        prediction: {
          winProbability: number
          predictedWin: boolean
          modelVersion: string
        }
      }>
    >()
    const byAwayTeam = new Map<
      string,
      Array<{
        gameId: number
        gameDate: Date
        scheduleDate: string
        opponent: string
        isHome: boolean
        eloBefore: number
        prediction: {
          winProbability: number
          predictedWin: boolean
          modelVersion: string
        }
      }>
    >()

    for (const game of games) {
      const homeAbbrev = game.homeTeam.abbrev
      const awayAbbrev = game.awayTeam.abbrev
      const homeElo = currentElos[homeAbbrev] ?? params.initialRating
      const awayElo = currentElos[awayAbbrev] ?? params.initialRating

      const { homeWinProbability, awayWinProbability } =
        predictorService.predictGame(
          { homeAbbrev, awayAbbrev, homeElo, awayElo },
          params
        )

      const gameDate = new Date(game.startTimeUTC)
      const season = game.season

      if (!byHomeTeam.has(homeAbbrev)) byHomeTeam.set(homeAbbrev, [])
      byHomeTeam.get(homeAbbrev)!.push({
        gameId: game.id,
        gameDate,
        scheduleDate,
        opponent: awayAbbrev,
        isHome: true,
        eloBefore: homeElo,
        prediction: {
          winProbability: homeWinProbability,
          predictedWin: homeWinProbability >= 0.5,
          modelVersion,
        },
      })

      if (!byAwayTeam.has(awayAbbrev)) byAwayTeam.set(awayAbbrev, [])
      byAwayTeam.get(awayAbbrev)!.push({
        gameId: game.id,
        gameDate,
        scheduleDate,
        opponent: homeAbbrev,
        isHome: false,
        eloBefore: awayElo,
        prediction: {
          winProbability: awayWinProbability,
          predictedWin: awayWinProbability >= 0.5,
          modelVersion,
        },
      })

      void season
    }

    await Promise.all([
      ...[...byHomeTeam.entries()].map(([abbrev, games]) => {
        const season = games[0] ? this.extractSeason(games[0].gameDate) : 0
        return saveTeamSeasonPredictions(abbrev, season, games)
      }),
      ...[...byAwayTeam.entries()].map(([abbrev, games]) => {
        const season = games[0] ? this.extractSeason(games[0].gameDate) : 0
        return saveTeamSeasonPredictions(abbrev, season, games)
      }),
    ])
  }

  private extractSeason(gameDate: Date): number {
    const month = gameDate.getMonth() + 1
    const year = gameDate.getFullYear()
    const startYear = month >= 10 ? year : year - 1
    return parseInt(`${startYear}${startYear + 1}`)
  }
}

export const predictionsService = PredictionsService.getInstance()
