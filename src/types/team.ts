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
