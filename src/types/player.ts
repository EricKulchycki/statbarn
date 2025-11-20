export interface Player {
  id: number
  firstName: string
  lastName: string
  fullName: string
  sweaterNumber: number
  positionCode: PlayerPosition
  headshot?: string
  teamId: number
  teamAbbrev: string
}

export interface PlayerStats {
  playerId: number
  season: number
  gamesPlayed: number
  goals: number
  assists: number
  points: number
  plusMinus: number
  penaltyMinutes: number
  powerPlayGoals: number
  powerPlayPoints: number
  gameWinningGoals: number
  overtimeGoals: number
  shots: number
  shootingPctg: number
  avgTimeOnIcePerGame?: string
}

export interface GoalieStats {
  playerId: number
  season: number
  gamesPlayed: number
  gamesStarted: number
  wins: number
  losses: number
  otLosses: number
  shotsAgainst: number
  saves: number
  goalsAgainst: number
  savePctg: number
  goalsAgainstAvg: number
  shutouts: number
  timeOnIce: string
}

export interface PlayerWithStats extends Player {
  stats?: PlayerStats
  goalieStats?: GoalieStats
}

export enum PlayerPosition {
  CENTER = 'C',
  LEFT_WING = 'L',
  RIGHT_WING = 'R',
  DEFENSEMAN = 'D',
  GOALIE = 'G',
}

export type SkaterPosition =
  | PlayerPosition.CENTER
  | PlayerPosition.LEFT_WING
  | PlayerPosition.RIGHT_WING
  | PlayerPosition.DEFENSEMAN

export interface TopScorer extends PlayerWithStats {
  rank: number
}

// NHL API Response Types
export interface NHLPlayerName {
  default: string
  [key: string]: string
}

export interface NHLTeamName {
  default: string
}

export interface NHLSkaterLeader {
  id: number
  firstName: NHLPlayerName
  lastName: NHLPlayerName
  sweaterNumber: number
  headshot: string
  teamAbbrev: string
  teamName: NHLTeamName
  teamLogo: string
  position: string
  value: number
}

export interface NHLGoalieLeader {
  id: number
  firstName: NHLPlayerName
  lastName: NHLPlayerName
  sweaterNumber: number
  headshot: string
  teamAbbrev: string
  teamName: NHLTeamName
  teamLogo: string
  position: string
  value: number
}

export interface NHLSkaterStatsResponse {
  [category: string]: NHLSkaterLeader[]
}

export interface NHLGoalieStatsResponse {
  [category: string]: NHLGoalieLeader[]
}

// Enhanced player stats with multiple categories combined
export interface EnhancedSkaterStats extends NHLSkaterLeader {
  goals?: number
  assists?: number
  points: number
  gamesPlayed?: number
  powerPlayGoals?: number
  shots?: number
  plusMinus?: number
  // Calculated stats
  pointsPerGame?: number
  goalsPerGame?: number
  assistsPerGame?: number
  shootingPctg?: number
}

export interface EnhancedGoalieStats extends NHLGoalieLeader {
  wins?: number
  savePctg: number
  goalsAgainstAvg?: number
  shutouts?: number
  gamesPlayed?: number
  // Calculated stats
  winPctg?: number
  shutoutRate?: number
}

// Player Landing API Response Types
export interface PlayerLandingResponse {
  playerId: number
  firstName: NHLPlayerName
  lastName: NHLPlayerName
  sweaterNumber: number
  position: string
  headshot: string
  teamLogo: string
  currentTeamAbbrev: string
  featuredStats: {
    season: number
    regularSeason: {
      subSeason: {
        assists: number
        gameWinningGoals: number
        gamesPlayed: number
        goals: number
        otGoals: number
        pim: number
        plusMinus: number
        points: number
        powerPlayGoals: number
        powerPlayPoints: number
        shootingPctg: number
        shorthandedGoals: number
        shorthandedPoints: number
        shots: number
      }
    }
  }
}

export interface GoalieLandingResponse {
  playerId: number
  firstName: NHLPlayerName
  lastName: NHLPlayerName
  sweaterNumber: number
  position: string
  headshot: string
  teamLogo: string
  currentTeamAbbrev: string
  featuredStats: {
    season: number
    regularSeason: {
      subSeason: {
        gamesPlayed: number
        gamesStarted: number
        wins: number
        losses: number
        otLosses: number
        savePctg: number
        goalsAgainstAvg: number
        shutouts: number
      }
    }
  }
}
