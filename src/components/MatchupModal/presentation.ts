// Pure view-model helpers for the matchup modal. Components only map these
// results to markup, so every display decision is unit-testable.
import {
  MatchupData,
  MatchupHistoryGame,
  TeamSeasonStats,
} from '@/actions/matchup'
import { FALLBACK_TEAM_COLORS, getTeamColor } from '@/constants/teamColors'
import { NHLGame } from '@/types/game'
import { GamePrediction } from '@/types/gamePrediction'
import { Team } from '@/types/team'
import { getTeamFullName } from '@/utils/team'
import { DateTime } from 'luxon'

// Below this many games per team, season averages are mostly noise
export const EARLY_SEASON_GAMES = 10

// Slate-500, for meetings without a winner
const TIE_COLOR = '#64748B'

export type TeamSide = 'away' | 'home'
export type ConfidenceTier = 'Toss-up' | 'Lean' | 'Strong'

export interface MatchupTeamModel {
  side: TeamSide
  abbrev: string
  city: string
  nickname: string
  logo: string
  color: string
  winPercent: string
  winProbability: number
}

export interface MatchupHeroModel {
  away: MatchupTeamModel
  home: MatchupTeamModel
  pick: string
  tier: ConfidenceTier
}

export interface StatSideModel {
  text: string
  fill: number
  isBetter: boolean
}

export interface StatRowModel {
  label: string
  away: StatSideModel
  home: StatSideModel
}

export interface MeetingRowModel {
  gameId: number
  dateLabel: string
  away: { abbrev: string; score: number; isWinner: boolean }
  home: { abbrev: string; score: number; isWinner: boolean }
  margin: { winner: string; text: string; color: string } | null
}

export interface MeetingsModel {
  recordLabel: string
  strip: { gameId: number; winner: string; color: string }[]
  oldestLabel: string
  rows: MeetingRowModel[]
}

export function formatPercent(probability: number): string {
  return `${Math.round(probability * 100)}%`
}

export function formatKickoff(
  startTimeUTC: string,
  city: string,
  zone = 'local'
): string {
  const start = DateTime.fromISO(startTimeUTC, { zone: 'utc' }).setZone(zone)
  return `${start.toFormat('ccc, LLL d')} · ${start.toFormat('h:mm a')} · ${city}`
}

export function getConfidenceTier(pickProbability: number): ConfidenceTier {
  if (pickProbability < 0.6) return 'Toss-up'
  if (pickProbability < 0.7) return 'Lean'
  return 'Strong'
}

// "Vegas Golden Knights" with city "Vegas" → nickname "Golden Knights"
export function splitTeamName(
  fullName: string | undefined,
  city: string
): { city: string; nickname: string } {
  if (fullName?.startsWith(`${city} `)) {
    return { city, nickname: fullName.slice(city.length + 1) }
  }
  return { city: fullName ?? city, nickname: '' }
}

// Two teams can share an accent; keep the bar halves distinguishable
function resolveColors(away: string, home: string) {
  const awayColor = getTeamColor(away, 'away')
  const homeColor = getTeamColor(home, 'home')
  if (awayColor !== homeColor) return { awayColor, homeColor }

  const alternate =
    homeColor === FALLBACK_TEAM_COLORS.home
      ? FALLBACK_TEAM_COLORS.away
      : FALLBACK_TEAM_COLORS.home
  return { awayColor, homeColor: alternate }
}

export function buildHero(
  game: NHLGame,
  prediction: GamePrediction,
  teams: Team[]
): MatchupHeroModel {
  const { awayColor, homeColor } = resolveColors(
    game.awayTeam.abbrev,
    game.homeTeam.abbrev
  )

  const toTeam = (
    side: TeamSide,
    nhlTeam: NHLGame['awayTeam'],
    color: string,
    winProbability: number
  ): MatchupTeamModel => ({
    side,
    abbrev: nhlTeam.abbrev,
    ...splitTeamName(
      getTeamFullName(teams, nhlTeam.abbrev),
      nhlTeam.placeName.default
    ),
    logo: nhlTeam.darkLogo || nhlTeam.logo,
    color,
    winPercent: formatPercent(winProbability),
    winProbability,
  })

  const pickProbability =
    prediction.predictedWinner === game.homeTeam.abbrev
      ? prediction.homeTeamWinProbability
      : prediction.awayTeamWinProbability

  return {
    away: toTeam(
      'away',
      game.awayTeam,
      awayColor,
      prediction.awayTeamWinProbability
    ),
    home: toTeam(
      'home',
      game.homeTeam,
      homeColor,
      prediction.homeTeamWinProbability
    ),
    pick: prediction.predictedWinner,
    tier: getConfidenceTier(pickProbability),
  }
}

export function findTeamStats(
  data: MatchupData,
  abbrev: string
): TeamSeasonStats | undefined {
  return [data.teamASeasonStats, data.teamBSeasonStats].find(
    (s) => s.teamAbbrev === abbrev
  )
}

type Better = 'higher' | 'lower' | 'neither'

function compareStat(
  label: string,
  away: number,
  home: number,
  better: Better,
  format: (value: number) => string
): StatRowModel {
  // Bars show each side's share of the larger value; negatives show empty
  const scale = Math.max(away, home, 0)
  const fill = (value: number) => (scale > 0 ? Math.max(value, 0) / scale : 0)

  const awayBetter =
    (better === 'higher' && away > home) || (better === 'lower' && away < home)
  const homeBetter =
    (better === 'higher' && home > away) || (better === 'lower' && home < away)

  return {
    label,
    away: { text: format(away), fill: fill(away), isBetter: awayBetter },
    home: { text: format(home), fill: fill(home), isBetter: homeBetter },
  }
}

const twoDecimals = (value: number) => value.toFixed(2)
const signedTwoDecimals = (value: number) =>
  value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)

export function buildStatRows(
  away: TeamSeasonStats,
  home: TeamSeasonStats
): StatRowModel[] {
  const diff = (s: TeamSeasonStats) => s.avgPointsScored - s.avgPointsAllowed

  return [
    compareStat(
      'Goals for / game',
      away.avgPointsScored,
      home.avgPointsScored,
      'higher',
      twoDecimals
    ),
    compareStat(
      'Goals against / game',
      away.avgPointsAllowed,
      home.avgPointsAllowed,
      'lower',
      twoDecimals
    ),
    compareStat(
      'Goal diff / game',
      diff(away),
      diff(home),
      'higher',
      signedTwoDecimals
    ),
    compareStat(
      'Games played',
      away.totalGames,
      home.totalGames,
      'neither',
      String
    ),
  ]
}

export function getSampleSizeNote(
  away: TeamSeasonStats,
  home: TeamSeasonStats
): string | null {
  const fewest = Math.min(away.totalGames, home.totalGames)
  const most = Math.max(away.totalGames, home.totalGames)

  if (most === 0) return 'No games played yet this season.'
  if (fewest >= EARLY_SEASON_GAMES) return null

  const range = fewest === most ? `${fewest}` : `${fewest}–${most}`
  const noun = most === 1 ? 'game' : 'games'
  return `Early season: only ${range} ${noun} each, so these averages will swing a lot.`
}

function formatMeetingDate(isoDate: string, format: string): string {
  return DateTime.fromISO(isoDate).toFormat(format)
}

export function buildMeetings(
  history: MatchupHistoryGame[],
  hero: MatchupHeroModel
): MeetingsModel | null {
  if (history.length === 0) return null

  const colorOf = (abbrev: string) => {
    if (abbrev === hero.away.abbrev) return hero.away.color
    if (abbrev === hero.home.abbrev) return hero.home.color
    return TIE_COLOR
  }

  const wins = (abbrev: string) =>
    history.filter((g) => g.winner === abbrev).length
  const awayWins = wins(hero.away.abbrev)
  const homeWins = wins(hero.home.abbrev)

  const recordLabel =
    awayWins === homeWins
      ? `Even ${awayWins}–${homeWins}`
      : awayWins > homeWins
        ? `${hero.away.abbrev} ${awayWins}–${homeWins}`
        : `${hero.home.abbrev} ${homeWins}–${awayWins}`

  // History arrives newest first; the strip reads oldest → most recent
  const oldestFirst = [...history].reverse()

  return {
    recordLabel,
    strip: oldestFirst.map((g) => ({
      gameId: g.gameId,
      winner: g.winner,
      color: colorOf(g.winner),
    })),
    oldestLabel: formatMeetingDate(oldestFirst[0].date, 'LLL yyyy'),
    rows: history.map((g) => ({
      gameId: g.gameId,
      dateLabel: formatMeetingDate(g.date, 'LLL d, yyyy'),
      away: {
        abbrev: g.awayTeam,
        score: g.awayScore,
        isWinner: g.winner === g.awayTeam,
      },
      home: {
        abbrev: g.homeTeam,
        score: g.homeScore,
        isWinner: g.winner === g.homeTeam,
      },
      margin:
        g.winner === 'TIE'
          ? null
          : {
              winner: g.winner,
              text: `+${Math.abs(g.homeScore - g.awayScore)}`,
              color: colorOf(g.winner),
            },
    })),
  }
}
