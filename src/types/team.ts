export interface NHLTeam {
  abbrev: string
  awaySplitSquad: boolean
  darkLogo: string
  id: number
  logo: string
  placeName: {
    default: string
  }
  placeNameWithPreposition: {
    default: string
    fr: string
  }
  radioLink: string
  score: number
}

export interface Team {
  id: number
  franchiseId: number
  fullName: string
  leagueId: number
  rawTricode: string
  triCode: string
  conference: Conference
  division: Division
  logo?: string
}

export interface EloReset {
  date: Date
  reason: string
  fromElo: number
  toElo: number
}

export interface TeamSeasonGame {
  gameId: number
  gameDate: Date
  opponent: string
  isHome: boolean
  eloBefore: number
  prediction?: {
    winProbability: number
    predictedWin: boolean
    modelVersion: string
  }
  outcome?: {
    actualWin: boolean
    eloAfter: number
    eloChange: number
    score: { team: number; opponent: number }
  }
}

export interface TeamSeason {
  season: number
  startElo: number
  games: TeamSeasonGame[]
}

export enum Conference {
  EASTERN = 'eastern',
  WESTERN = 'western',
}

export enum Division {
  ATLANTIC = 'atlantic',
  CENTRAL = 'central',
  METROPOLITAN = 'metropolitan',
  PACIFIC = 'pacific',
}
