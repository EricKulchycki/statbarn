import { DayAbbrev } from './common'
import { NHLTeam } from './team'

export interface NHLGameWeek {
  nextStartDate: string
  previousStartStart: string
  gameWeek: NHLGameDay[]
  preSeasonStartDate?: string
  regularSeasonStartDate?: string
  regularSeasonEndDate?: string
  playoffEndDate?: string
}

export interface NHLGameDay {
  date: string
  dayAbbrev: DayAbbrev
  games: NHLGame[]
  numberOfGames: number
}

export interface NHLGame {
  homeTeam: NHLTeam
  awayTeam: NHLTeam
  easternUTCOffset: string
  gameCenterLink: string
  gameScheduleState: string
  gameState: string
  gameType: number
  id: number
  neutralSite: boolean
  periodDescriptor: {
    maxRegulationPeriods: number
    number: number
    periodType: string
  }
  season: number
  startTimeUTC: string
  tvBroadcasts: NHLTVBroadcast[]
  venue: {
    default: string
  }
  venueTimezone: string
  venueUTCOffset: string
}

export interface NHLTVBroadcast {
  id: number
  countryCode: string
  market: string
  network: string
  sequenceNumber: number
}
