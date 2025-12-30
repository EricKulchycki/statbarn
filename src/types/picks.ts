export interface Game {
  gameId: number
  season: number
  gameDate: string
  homeTeam: {
    abbrev: string
    logo: string
    eloBefore: number
    score: number
  }
  awayTeam: {
    abbrev: string
    logo: string
    eloBefore: number
    score: number
  }
  expectedResult: {
    homeTeam: number
    awayTeam: number
  }
}

export interface UserPick {
  gameId: number
  pickedTeam: string
  confidence?: number
}

export interface UserStats {
  totalPicks: number
  correctPicks: number
  accuracy: number
  currentStreak: number
  longestStreak: number
  totalPoints: number
  rank?: number
}
