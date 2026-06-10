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
