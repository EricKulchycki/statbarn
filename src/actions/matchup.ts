'use server'

import { Database } from '@/lib/db'
import { GameELOModel } from '@/models/gameElo'

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

  // Find all games between these two teams, sorted by date descending
  const games = await GameELOModel.find({
    $or: [
      { 'homeTeam.abbrev': teamA, 'awayTeam.abbrev': teamB },
      { 'homeTeam.abbrev': teamB, 'awayTeam.abbrev': teamA },
    ],
  })
    .sort({ gameDate: -1 })
    .limit(limit)
    .lean()

  const history: MatchupHistoryGame[] = games.map((game) => {
    const homeScore = game.homeTeam.score
    const awayScore = game.awayTeam.score
    const winner =
      homeScore > awayScore
        ? game.homeTeam.abbrev
        : awayScore > homeScore
          ? game.awayTeam.abbrev
          : 'TIE'

    return {
      date: game.gameDate.toISOString().split('T')[0],
      homeTeam: game.homeTeam.abbrev,
      awayTeam: game.awayTeam.abbrev,
      homeScore,
      awayScore,
      winner,
      season: game.season,
      gameId: game.gameId,
    }
  })

  // Calculate last 5 record
  const last5Record = { teamA: 0, teamB: 0, ties: 0 }
  history.forEach((game) => {
    if (game.winner === teamA) last5Record.teamA++
    else if (game.winner === teamB) last5Record.teamB++
    else last5Record.ties++
  })

  // Get current season (assuming it's 2025-2026)
  const currentSeason = 20252026

  // Calculate season stats for team A
  const teamAGames = await GameELOModel.find({
    season: currentSeason,
    $or: [{ 'homeTeam.abbrev': teamA }, { 'awayTeam.abbrev': teamA }],
  }).lean()

  let teamAPointsScored = 0
  let teamAPointsAllowed = 0
  teamAGames.forEach((game) => {
    if (game.homeTeam.abbrev === teamA) {
      teamAPointsScored += game.homeTeam.score
      teamAPointsAllowed += game.awayTeam.score
    } else {
      teamAPointsScored += game.awayTeam.score
      teamAPointsAllowed += game.homeTeam.score
    }
  })

  const teamASeasonStats: TeamSeasonStats = {
    teamAbbrev: teamA,
    avgPointsScored:
      teamAGames.length > 0 ? teamAPointsScored / teamAGames.length : 0,
    avgPointsAllowed:
      teamAGames.length > 0 ? teamAPointsAllowed / teamAGames.length : 0,
    totalGames: teamAGames.length,
  }

  // Calculate season stats for team B
  const teamBGames = await GameELOModel.find({
    season: currentSeason,
    $or: [{ 'homeTeam.abbrev': teamB }, { 'awayTeam.abbrev': teamB }],
  }).lean()

  let teamBPointsScored = 0
  let teamBPointsAllowed = 0
  teamBGames.forEach((game) => {
    if (game.homeTeam.abbrev === teamB) {
      teamBPointsScored += game.homeTeam.score
      teamBPointsAllowed += game.awayTeam.score
    } else {
      teamBPointsScored += game.awayTeam.score
      teamBPointsAllowed += game.homeTeam.score
    }
  })

  const teamBSeasonStats: TeamSeasonStats = {
    teamAbbrev: teamB,
    avgPointsScored:
      teamBGames.length > 0 ? teamBPointsScored / teamBGames.length : 0,
    avgPointsAllowed:
      teamBGames.length > 0 ? teamBPointsAllowed / teamBGames.length : 0,
    totalGames: teamBGames.length,
  }

  return {
    history,
    teamASeasonStats,
    teamBSeasonStats,
    last5Record,
  }
}
