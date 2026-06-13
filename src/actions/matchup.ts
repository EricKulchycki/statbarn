'use server'

import { Database } from '@/lib/db'
import { TeamModel } from '@/models/team'
import { TeamSeasonGame } from '@/types/team'
import { getCurrentNHLSeason } from '@/utils/currentSeason'

export interface MatchupHistoryGame {
  date: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  winner: string
  season: number
  gameId: number
}

export interface TeamSeasonStats {
  teamAbbrev: string
  avgPointsScored: number
  avgPointsAllowed: number
  totalGames: number
}

export interface MatchupData {
  history: MatchupHistoryGame[]
  teamASeasonStats: TeamSeasonStats
  teamBSeasonStats: TeamSeasonStats
  last5Record: {
    teamA: number
    teamB: number
    ties: number
  }
}

export async function getMatchupHistory(
  teamA: string,
  teamB: string,
  limit = 5
): Promise<MatchupData> {
  const db = Database.getInstance()
  await db.connect()

  const currentSeason = Number(getCurrentNHLSeason())

  const h2hGames: TeamSeasonGame[] = await TeamModel.aggregate([
    { $match: { triCode: teamA } },
    { $unwind: '$seasons' },
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
  ])

  const history: MatchupHistoryGame[] = h2hGames.map((game) => {
    const teamScore = game.outcome!.score.team
    const opponentScore = game.outcome!.score.opponent
    const homeScore = game.isHome ? teamScore : opponentScore
    const awayScore = game.isHome ? opponentScore : teamScore
    const homeTeam = game.isHome ? teamA : teamB
    const awayTeam = game.isHome ? teamB : teamA
    const winner =
      homeScore > awayScore
        ? homeTeam
        : awayScore > homeScore
          ? awayTeam
          : 'TIE'

    return {
      date: new Date(game.gameDate).toISOString().split('T')[0],
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      winner,
      season: currentSeason,
      gameId: game.gameId,
    }
  })

  const last5Record = { teamA: 0, teamB: 0, ties: 0 }
  history.forEach((g) => {
    if (g.winner === teamA) last5Record.teamA++
    else if (g.winner === teamB) last5Record.teamB++
    else last5Record.ties++
  })

  const [teamASeasonStats, teamBSeasonStats] = await Promise.all([
    getTeamSeasonStats(teamA, currentSeason),
    getTeamSeasonStats(teamB, currentSeason),
  ])

  return { history, teamASeasonStats, teamBSeasonStats, last5Record }
}

async function getTeamSeasonStats(
  abbrev: string,
  season: number
): Promise<TeamSeasonStats> {
  const games: TeamSeasonGame[] = await TeamModel.aggregate([
    { $match: { triCode: abbrev } },
    { $unwind: '$seasons' },
    { $match: { 'seasons.season': season } },
    { $unwind: '$seasons.games' },
    { $match: { 'seasons.games.outcome': { $exists: true } } },
    { $replaceRoot: { newRoot: '$seasons.games' } },
  ])

  let scored = 0
  let allowed = 0
  for (const game of games) {
    scored += game.outcome!.score.team
    allowed += game.outcome!.score.opponent
  }

  return {
    teamAbbrev: abbrev,
    avgPointsScored: games.length > 0 ? scored / games.length : 0,
    avgPointsAllowed: games.length > 0 ? allowed / games.length : 0,
    totalGames: games.length,
  }
}
