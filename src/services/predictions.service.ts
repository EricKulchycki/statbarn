import { ELO_CONFIG } from '@/constants'
import {
  getGamePredictionsForGameIds,
  saveTeamSeasonPredictions,
} from '@/data/teams'
import { ELOsByTeam } from '@/lib/eloCalculator'
import { NHLGame, NHLGameWeek } from '@/types/game'
import { GamePrediction } from '@/types/gamePrediction'
import { eloService } from './elo.service'
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

  async createNextDayPredictions(): Promise<void> {
    const tomorrow = new Date().toISOString().slice(0, 10)

    const gameWeek = await scheduleService.getScheduleByDate(tomorrow)
    const games = (gameWeek.gameWeek[0]?.games || []).filter(
      (g) => g.gameType === 2
    )

    if (games.length === 0) return

    const latestElos = await eloService.getLatestElos()
    const eloMap = Object.fromEntries(latestElos.map((e) => [e.abbrev, e.elo]))

    await this.predictGames(games, eloMap)
  }

  async predictGames(
    games: NHLGame[],
    currentElos: ELOsByTeam,
    modelVersion = 'v1'
  ): Promise<void> {
    const byHomeTeam = new Map<
      string,
      Array<{
        gameId: number
        gameDate: Date
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
      const homeElo = currentElos[homeAbbrev] ?? ELO_CONFIG.initialRating
      const awayElo = currentElos[awayAbbrev] ?? ELO_CONFIG.initialRating

      const { homeWinProbability, awayWinProbability } =
        predictorService.predictGame({
          homeAbbrev,
          awayAbbrev,
          homeElo,
          awayElo,
        })

      const gameDate = new Date(game.startTimeUTC)
      const season = game.season

      if (!byHomeTeam.has(homeAbbrev)) byHomeTeam.set(homeAbbrev, [])
      byHomeTeam.get(homeAbbrev)!.push({
        gameId: game.id,
        gameDate,
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
