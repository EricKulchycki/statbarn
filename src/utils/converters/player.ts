import { PlayerDocument } from '@/models/player'
import { PlayerStatsDocument } from '@/models/playerStats'
import { GoalieStatsDocument } from '@/models/goalieStats'
import { Player, PlayerStats, GoalieStats } from '@/types/player'

export function toDomainPlayer(doc: PlayerDocument): Player {
  return {
    id: doc.id,
    firstName: doc.firstName,
    lastName: doc.lastName,
    fullName: doc.fullName,
    sweaterNumber: doc.sweaterNumber,
    positionCode: doc.positionCode,
    headshot: doc.headshot,
    teamId: doc.teamId,
    teamAbbrev: doc.teamAbbrev,
  }
}

export function toDomainPlayerStats(doc: PlayerStatsDocument): PlayerStats {
  return {
    playerId: doc.playerId,
    season: doc.season,
    gamesPlayed: doc.gamesPlayed,
    goals: doc.goals,
    assists: doc.assists,
    points: doc.points,
    plusMinus: doc.plusMinus,
    penaltyMinutes: doc.penaltyMinutes,
    powerPlayGoals: doc.powerPlayGoals,
    powerPlayPoints: doc.powerPlayPoints,
    gameWinningGoals: doc.gameWinningGoals,
    overtimeGoals: doc.overtimeGoals,
    shots: doc.shots,
    shootingPctg: doc.shootingPctg,
    avgTimeOnIcePerGame: doc.avgTimeOnIcePerGame,
  }
}

export function toDomainGoalieStats(doc: GoalieStatsDocument): GoalieStats {
  return {
    playerId: doc.playerId,
    season: doc.season,
    gamesPlayed: doc.gamesPlayed,
    gamesStarted: doc.gamesStarted,
    wins: doc.wins,
    losses: doc.losses,
    otLosses: doc.otLosses,
    shotsAgainst: doc.shotsAgainst,
    saves: doc.saves,
    goalsAgainst: doc.goalsAgainst,
    savePctg: doc.savePctg,
    goalsAgainstAvg: doc.goalsAgainstAvg,
    shutouts: doc.shutouts,
    timeOnIce: doc.timeOnIce,
  }
}
