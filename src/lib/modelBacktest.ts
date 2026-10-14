import { ModelBacktest, SeasonBacktest } from '@/types/modelVersion'
import { brierScore, ForecastOutcome } from '@/utils/brierScore'
import {
  adjustKFactor,
  calculateELOUpdate,
  matchupFactorFromRecord,
  predictGame,
  regressToMean,
  type ModelParams,
} from '@statbarn/prediction-core'

export interface ReplayGame {
  season: number
  gameDate: Date
  home: string
  away: string
  homeScore: number
  awayScore: number
}

export interface SeasonForecast extends ForecastOutcome {
  season: number
}

export interface BacktestRun {
  backtest: ModelBacktest
  forecasts: SeasonForecast[]
}

const MATCHUP_HISTORY = 5

// Replays stored results in date order with the given params, the way the
// nightly crons would have: predict from current ratings (no head-to-head
// factor, as published), then update Elo (with it). Ratings regress between
// seasons. Every prediction uses only games played before it.
export function backtestModel(
  games: ReplayGame[],
  params: ModelParams,
  {
    holdoutSeason,
    currentSeason,
  }: {
    holdoutSeason: number | null
    // In progress, so reported but never used for tuning
    currentSeason: number | null
  }
): BacktestRun {
  const ratings = new Map<string, number>()
  // Per season: each pairing's results, as "did <first team> win"
  const meetings = new Map<string, boolean[]>()
  const forecasts: SeasonForecast[] = []
  let season: number | null = null

  const sorted = [...games].sort(
    (a, b) => a.gameDate.getTime() - b.gameDate.getTime()
  )

  for (const g of sorted) {
    if (g.season !== season) {
      if (season !== null) {
        for (const [team, elo] of ratings) {
          ratings.set(team, regressToMean(elo, params))
        }
      }
      meetings.clear()
      season = g.season
    }

    const homeElo = ratings.get(g.home) ?? params.initialRating
    const awayElo = ratings.get(g.away) ?? params.initialRating
    const homeWon = g.homeScore > g.awayScore

    const { homeWinProbability } = predictGame(
      { homeAbbrev: g.home, awayAbbrev: g.away, homeElo, awayElo },
      params
    )
    forecasts.push({
      season: g.season,
      probability: homeWinProbability,
      occurred: homeWon,
    })

    const pairKey = [g.home, g.away].sort().join(':')
    const pairResults = meetings.get(pairKey) ?? []
    const recent = pairResults.slice(-MATCHUP_HISTORY)
    const homeIsFirst = pairKey.startsWith(`${g.home}:`)
    const homeMeetingWins = recent.filter((firstWon) =>
      homeIsFirst ? firstWon : !firstWon
    ).length
    const matchupFactor = matchupFactorFromRecord(
      homeMeetingWins,
      recent.length,
      params.matchupMaxAdjustment
    )

    const k = adjustKFactor(
      params.kFactor,
      Math.abs(g.homeScore - g.awayScore),
      params.marginOfVictory
    )
    const result = calculateELOUpdate(
      g.home,
      g.away,
      homeElo,
      awayElo,
      g.homeScore,
      g.awayScore,
      matchupFactor,
      k,
      params
    )
    ratings.set(g.home, result.homeTeam.eloAfter)
    ratings.set(g.away, result.awayTeam.eloAfter)
    meetings.set(pairKey, [...pairResults, homeIsFirst ? homeWon : !homeWon])
  }

  return {
    backtest: summarize(forecasts, holdoutSeason, currentSeason),
    forecasts,
  }
}

function summarize(
  forecasts: SeasonForecast[],
  holdoutSeason: number | null,
  currentSeason: number | null
): ModelBacktest {
  const seasonNumbers = [...new Set(forecasts.map((f) => f.season))].sort()
  const seasons: SeasonBacktest[] = seasonNumbers.map((season) => {
    const inSeason = forecasts.filter((f) => f.season === season)
    return { season, games: inSeason.length, brier: brierScore(inSeason)! }
  })

  const trainSeasons = seasonNumbers.filter(
    (s) => s !== holdoutSeason && s !== currentSeason
  )
  const hasHoldout =
    holdoutSeason !== null && seasonNumbers.includes(holdoutSeason)

  return {
    ranAt: new Date(),
    trainSeasons,
    trainBrier: brierScore(
      forecasts.filter((f) => trainSeasons.includes(f.season))
    ),
    holdoutSeason: hasHoldout ? holdoutSeason : null,
    holdoutBrier: hasHoldout
      ? brierScore(forecasts.filter((f) => f.season === holdoutSeason))
      : null,
    seasons,
  }
}

export interface CalibrationBucket {
  range: [number, number]
  games: number
  predicted: number
  actual: number
}

// How often favourites won compared with how likely the model said they were
export function calibrationBuckets(
  forecasts: ForecastOutcome[],
  edges = [0.5, 0.55, 0.6, 0.65, 0.7, 0.8, 1.0001]
): CalibrationBucket[] {
  const favourites = forecasts.map((f) => ({
    probability: Math.max(f.probability, 1 - f.probability),
    favouriteWon: f.probability >= 0.5 ? f.occurred : !f.occurred,
  }))

  return edges.slice(0, -1).flatMap((lo, i) => {
    const hi = edges[i + 1]
    const inBucket = favourites.filter(
      (f) => f.probability >= lo && f.probability < hi
    )
    if (inBucket.length === 0) return []
    const total = (pick: (f: (typeof inBucket)[0]) => number) =>
      inBucket.reduce((sum, f) => sum + pick(f), 0)
    return [
      {
        range: [lo, Math.min(hi, 1)] as [number, number],
        games: inBucket.length,
        predicted: total((f) => f.probability) / inBucket.length,
        actual: total((f) => (f.favouriteWon ? 1 : 0)) / inBucket.length,
      },
    ]
  })
}
