import { TeamModel } from '@/models/team'
import { GamePrediction } from '@/types/gamePrediction'
import { Team, TeamSeasonGame } from '@/types/team'
import { toDomainTeam } from '@/utils/converters/team'
import { getCurrentNHLSeason } from '@/utils/currentSeason'
import { DateTime } from 'luxon'
import { PipelineStage } from 'mongoose'
export interface LatestELO {
  abbrev: string
  elo: number
  season: number
}

export async function getTeams(): Promise<Team[]> {
  const teamModel = await TeamModel.find().exec()
  return teamModel.map(toDomainTeam)
}

export async function getTeamById(id: number): Promise<Team | null> {
  const team = await TeamModel.findOne({ id }).exec()
  return team ? toDomainTeam(team) : null
}

export async function getTeamByAbbrev(abbrev: string): Promise<Team | null> {
  const team = await TeamModel.findOne({ triCode: abbrev }).exec()
  return team ? toDomainTeam(team) : null
}

export async function getLatestEloData(): Promise<LatestELO[]> {
  const currentSeason = Number(getCurrentNHLSeason())
  const teams = await TeamModel.find(
    { currentElo: { $exists: true } },
    { triCode: 1, currentElo: 1 }
  ).lean()
  return teams.map((team) => ({
    abbrev: team.triCode,
    elo: team.currentElo!,
    season: currentSeason,
  }))
}

export async function getTeamSeasonGames(
  abbrev: string,
  season: number,
  limit?: number
): Promise<TeamSeasonGame[]> {
  const pipeline: PipelineStage[] = [
    { $match: { triCode: abbrev } },
    { $unwind: '$seasons' },
    { $match: { 'seasons.season': season } },
    { $unwind: '$seasons.games' },
    { $sort: { 'seasons.games.gameDate': -1 } },
    { $replaceRoot: { newRoot: '$seasons.games' } },
  ]
  if (limit) pipeline.push({ $limit: limit })
  return TeamModel.aggregate(pipeline)
}

export async function getLeagueGameHistoryByTeam(
  season: number,
  limit: number
): Promise<{ [abbrev: string]: TeamSeasonGame[] }> {
  const teams = await TeamModel.find(
    { 'seasons.season': season },
    { triCode: 1, 'seasons.$': 1 }
  ).lean()

  const result: { [abbrev: string]: TeamSeasonGame[] } = {}
  for (const team of teams) {
    const seasonDoc = team.seasons?.find(
      (s: { season: number }) => s.season === season
    )
    if (!seasonDoc) continue
    const games = (seasonDoc.games as TeamSeasonGame[])
      .filter((g) => g.outcome)
      .sort(
        (a, b) =>
          new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime()
      )
      .slice(-limit)
    result[team.triCode] = games
  }
  return result
}

export async function getMatchupHistoryForTeam(
  teamA: string,
  teamB: string,
  limit: number,
  season?: number
): Promise<TeamSeasonGame[]> {
  const pipeline: PipelineStage[] = [
    { $match: { triCode: teamA } },
    { $unwind: '$seasons' },
    ...(season !== undefined ? [{ $match: { 'seasons.season': season } }] : []),
    { $unwind: '$seasons.games' },
    {
      $match: {
        'seasons.games.opponent': teamB,
        'seasons.games.outcome': { $exists: true },
      },
    },
    { $sort: { 'seasons.games.gameDate': -1 } },
    { $limit: limit },
    { $replaceRoot: { newRoot: '$seasons.games' } },
  ]
  return TeamModel.aggregate(pipeline)
}

export async function getGamePredictionsForGameIds(
  gameIds: number[]
): Promise<GamePrediction[]> {
  const results = await TeamModel.aggregate([
    { $unwind: '$seasons' },
    { $unwind: '$seasons.games' },
    {
      $match: {
        'seasons.games.gameId': { $in: gameIds },
        'seasons.games.isHome': true,
      },
    },
    { $project: { triCode: 1, game: '$seasons.games' } },
  ])
  return results.map((r) => teamGameToGamePrediction(r.triCode, r.game))
}

export async function getCompletedGamesForDate(
  date: Date
): Promise<GamePrediction[]> {
  const dateStr = DateTime.fromJSDate(date).toISODate()
  const start = new Date(`${dateStr}T00:00:00Z`)
  const end = new Date(`${dateStr}T23:59:59Z`)

  const results = await TeamModel.aggregate([
    { $unwind: '$seasons' },
    { $unwind: '$seasons.games' },
    {
      $match: {
        'seasons.games.isHome': true,
        'seasons.games.outcome': { $exists: true },
        'seasons.games.gameDate': { $gte: start, $lte: end },
      },
    },
    { $project: { triCode: 1, game: '$seasons.games' } },
  ])
  return results.map((r) => teamGameToGamePrediction(r.triCode, r.game))
}

export async function getAllGamePredictionsForSeason(
  season: number
): Promise<GamePrediction[]> {
  const results = await TeamModel.aggregate([
    { $unwind: '$seasons' },
    { $match: { 'seasons.season': season } },
    { $unwind: '$seasons.games' },
    {
      $match: {
        'seasons.games.isHome': true,
        'seasons.games.outcome': { $exists: true },
      },
    },
    { $project: { triCode: 1, game: '$seasons.games' } },
  ])
  return results.map((r) => teamGameToGamePrediction(r.triCode, r.game))
}

export async function countSeasonGames(season: number): Promise<number> {
  const result = await TeamModel.aggregate([
    { $unwind: '$seasons' },
    { $match: { 'seasons.season': season } },
    { $unwind: '$seasons.games' },
    {
      $match: {
        'seasons.games.isHome': true,
        'seasons.games.outcome': { $exists: true },
      },
    },
    { $count: 'total' },
  ])
  return result[0]?.total ?? 0
}

export async function countSeasonCorrectPredictions(
  season: number
): Promise<number> {
  const result = await TeamModel.aggregate([
    { $unwind: '$seasons' },
    { $match: { 'seasons.season': season } },
    { $unwind: '$seasons.games' },
    {
      $match: {
        'seasons.games.isHome': true,
        'seasons.games.outcome': { $exists: true },
        $expr: {
          $eq: [
            '$seasons.games.prediction.predictedWin',
            '$seasons.games.outcome.actualWin',
          ],
        },
      },
    },
    { $count: 'total' },
  ])
  return result[0]?.total ?? 0
}

function teamGameToGamePrediction(
  homeAbbrev: string,
  game: TeamSeasonGame
): GamePrediction {
  const homeWinProb = game.prediction?.winProbability ?? 0.5
  return {
    gameId: game.gameId,
    homeTeam: homeAbbrev,
    awayTeam: game.opponent,
    homeTeamWinProbability: homeWinProb,
    awayTeamWinProbability: 1 - homeWinProb,
    predictedWinner: homeWinProb >= 0.5 ? homeAbbrev : game.opponent,
    gameDate: new Date(game.gameDate),
    modelVersion: game.prediction?.modelVersion ?? 'v1',
    outcome: game.outcome
      ? {
          homeScore: game.outcome.score.team,
          awayScore: game.outcome.score.opponent,
          winner: game.outcome.actualWin ? homeAbbrev : game.opponent,
          correctPrediction:
            game.prediction != null
              ? game.prediction.predictedWin === game.outcome.actualWin
              : false,
        }
      : undefined,
  }
}

export async function saveTeamGameOutcome(
  abbrev: string,
  season: number,
  gameInfo: {
    gameId: number
    gameDate: Date
    opponent: string
    isHome: boolean
  },
  eloBefore: number,
  outcome: NonNullable<TeamSeasonGame['outcome']>
): Promise<void> {
  await TeamModel.updateOne(
    { triCode: abbrev, 'seasons.season': { $ne: season } },
    { $push: { seasons: { season, startElo: eloBefore, games: [] } } }
  )

  const updateResult = await TeamModel.updateOne(
    { triCode: abbrev },
    {
      $set: {
        currentElo: outcome.eloAfter,
        'seasons.$[s].games.$[g].outcome': outcome,
        'seasons.$[s].games.$[g].eloBefore': eloBefore,
      },
    },
    {
      arrayFilters: [{ 's.season': season }, { 'g.gameId': gameInfo.gameId }],
    }
  )

  if (updateResult.modifiedCount === 0) {
    await TeamModel.updateOne(
      { triCode: abbrev, 'seasons.season': season },
      {
        $set: { currentElo: outcome.eloAfter },
        $push: {
          'seasons.$.games': { ...gameInfo, eloBefore, outcome },
        },
      }
    )
  }
}

export async function recalculatePredictionsForTeam(
  abbrev: string,
  season: number,
  currentElos: { [abbrev: string]: number },
  modelVersion = 'v1'
): Promise<void> {
  const { predictorService } = await import('@/services/predictor.service')
  const { ELO_CONFIG } = await import('@/constants')

  const team = await TeamModel.findOne({ triCode: abbrev })
  if (!team) return

  const seasonDoc = team.seasons.find(
    (s: { season: number }) => s.season === season
  )
  if (!seasonDoc) return

  const teamElo = currentElos[abbrev] ?? ELO_CONFIG.initialRating

  for (const game of seasonDoc.games) {
    if (game.outcome) continue

    const opponentElo = currentElos[game.opponent] ?? ELO_CONFIG.initialRating
    const result = predictorService.predictGame({
      homeAbbrev: game.isHome ? abbrev : game.opponent,
      awayAbbrev: game.isHome ? game.opponent : abbrev,
      homeElo: game.isHome ? teamElo : opponentElo,
      awayElo: game.isHome ? opponentElo : teamElo,
    })

    const winProbability = game.isHome
      ? result.homeWinProbability
      : result.awayWinProbability

    game.prediction = {
      winProbability,
      predictedWin: winProbability >= 0.5,
      modelVersion,
    }
  }

  team.markModified('seasons')
  await team.save()
}

export async function saveTeamSeasonPredictions(
  abbrev: string,
  season: number,
  games: Array<{
    gameId: number
    gameDate: Date
    opponent: string
    isHome: boolean
    eloBefore: number
    prediction: NonNullable<TeamSeasonGame['prediction']>
  }>
): Promise<void> {
  if (games.length === 0) return

  const team = await TeamModel.findOne({ triCode: abbrev })
  if (!team) return

  let seasonDoc = team.seasons.find(
    (s: { season: number }) => s.season === season
  )

  if (!seasonDoc) {
    team.seasons.push({ season, startElo: games[0].eloBefore, games: [] })
    seasonDoc = team.seasons[team.seasons.length - 1]
  }

  for (const g of games) {
    const existing = seasonDoc.games.find(
      (sg: { gameId: number }) => sg.gameId === g.gameId
    )
    if (existing) {
      existing.prediction = g.prediction
      existing.eloBefore = g.eloBefore
    } else {
      seasonDoc.games.push(g)
    }
  }

  team.markModified('seasons')
  await team.save()
}
