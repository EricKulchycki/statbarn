import { NHLGame, NHLGameDay } from '@/types/game'
import { GamePrediction } from '@/types/gamePrediction'
import { GameStatus, isFinal, isLive } from '@/utils/game'
import { DateTime } from 'luxon'
import type { LiveGame } from './liveGames'

// Pure slate logic, safe to import from client components. Server data
// loading lives in daySlate.ts.

// Yesterday, today, and the next two days
export const DAY_NAV_LENGTH = 4

export type SlateGameState = 'live' | 'upcoming' | 'final'

export type PickStatus =
  | 'leading'
  | 'trailing'
  | 'level'
  | 'correct'
  | 'incorrect'

export interface SlateTeam {
  abbrev: string
  logo: string
  score: number | null
  winProbability: number | null
}

export interface SlateGame {
  id: number
  state: SlateGameState
  startTimeUTC: string
  finalLabel: string
  away: SlateTeam
  home: SlateTeam
  pick: string | null
  pickProbability: number | null
  pickStatus: PickStatus | null
}

export interface SlateRecord {
  correct: number
  incorrect: number
  leading: number
  trailing: number
  level: number
}

export interface DaySlate {
  date: string
  isToday: boolean
  label: string
  heading: string
  title: string
  summary: string
  games: SlateGame[]
  record: SlateRecord
}

export interface DaySlates {
  slates: DaySlate[]
  todayIso: string
  gamesById: Map<number, NHLGame>
  predictionsById: Map<number, GamePrediction>
}

function pluralizeGames(count: number): string {
  return `${count} game${count === 1 ? '' : 's'}`
}

function toGameState(gameState: GameStatus): SlateGameState {
  if (isLive(gameState)) return 'live'
  if (isFinal(gameState)) return 'final'
  return 'upcoming'
}

function toFinalLabel(periodType?: string | null): string {
  if (periodType === 'OT' || periodType === 'SO') return `FINAL/${periodType}`
  return 'FINAL'
}

function toPickStatus(
  state: SlateGameState,
  pickScore: number | null,
  otherScore: number | null
): PickStatus | null {
  if (state === 'upcoming' || pickScore === null || otherScore === null) {
    return null
  }
  if (state === 'final') return pickScore > otherScore ? 'correct' : 'incorrect'
  if (pickScore > otherScore) return 'leading'
  if (pickScore < otherScore) return 'trailing'
  return 'level'
}

function pickStatusFor(
  state: SlateGameState,
  pick: string | null,
  home: SlateTeam,
  away: SlateTeam
): PickStatus | null {
  if (!pick) return null
  const [picked, other] = pick === home.abbrev ? [home, away] : [away, home]
  return toPickStatus(state, picked.score, other.score)
}

export function toSlateGame(
  game: NHLGame,
  prediction?: GamePrediction
): SlateGame {
  const state = toGameState(game.gameState)
  const hasScores = state !== 'upcoming'

  const away: SlateTeam = {
    abbrev: game.awayTeam.abbrev,
    logo: game.awayTeam.logo,
    score: hasScores ? (game.awayTeam.score ?? null) : null,
    winProbability: prediction?.awayTeamWinProbability ?? null,
  }
  const home: SlateTeam = {
    abbrev: game.homeTeam.abbrev,
    logo: game.homeTeam.logo,
    score: hasScores ? (game.homeTeam.score ?? null) : null,
    winProbability: prediction?.homeTeamWinProbability ?? null,
  }

  const pick = prediction?.predictedWinner ?? null
  const picked = pick === home.abbrev ? home : away

  return {
    id: game.id,
    state,
    startTimeUTC: game.startTimeUTC,
    finalLabel: toFinalLabel(game.periodDescriptor?.periodType),
    away,
    home,
    pick,
    pickProbability: pick ? picked.winProbability : null,
    pickStatus: pickStatusFor(state, pick, home, away),
  }
}

function withLiveUpdate(game: SlateGame, live: LiveGame): SlateGame {
  const state = toGameState(live.gameState)
  const hasScores = state !== 'upcoming'
  const away = { ...game.away, score: hasScores ? live.awayScore : null }
  const home = { ...game.home, score: hasScores ? live.homeScore : null }

  return {
    ...game,
    state,
    finalLabel: toFinalLabel(live.periodType),
    away,
    home,
    pickStatus: pickStatusFor(state, game.pick, home, away),
  }
}

// Re-derives a slate in the browser as live updates arrive; the pick and
// probabilities stay as published, only state, scores and results move
export function applyLiveGames(
  slate: DaySlate,
  live: Map<number, LiveGame>,
  todayIso: string
): DaySlate {
  if (!slate.games.some((g) => live.has(g.id))) return slate

  const games = slate.games.map((g) => {
    const update = live.get(g.id)
    return update ? withLiveUpdate(g, update) : g
  })
  return {
    ...slate,
    games,
    record: tallyRecord(games),
    summary: summarizeDay(games, slate.date, todayIso),
  }
}

export function tallyRecord(games: SlateGame[]): SlateRecord {
  const count = (status: PickStatus) =>
    games.filter((g) => g.pickStatus === status).length

  return {
    correct: count('correct'),
    incorrect: count('incorrect'),
    leading: count('leading'),
    trailing: count('trailing'),
    level: count('level'),
  }
}

export function summarizeDay(
  games: SlateGame[],
  date: string,
  todayIso: string
): string {
  if (games.length === 0) return 'No games'
  if (games.every((g) => g.pick === null)) {
    return date < todayIso ? 'No predictions' : 'Upcoming'
  }

  const { correct, incorrect } = tallyRecord(games)

  if (games.every((g) => g.state === 'final')) {
    return `${correct}/${correct + incorrect} correct`
  }
  if (games.some((g) => g.state === 'final')) {
    return `${pluralizeGames(games.length)} · ${correct}–${incorrect} so far`
  }
  return pluralizeGames(games.length)
}

function toTitle(date: string, todayIso: string): string {
  if (date === todayIso) return "Tonight's slate"
  return date < todayIso ? 'Results' : 'Upcoming slate'
}

export function buildDaySlates(
  gameDays: NHLGameDay[],
  predictionsById: Map<number, GamePrediction>,
  todayIso: string
): DaySlate[] {
  return gameDays.slice(0, DAY_NAV_LENGTH).map((day) => {
    const games = day.games.map((game) =>
      toSlateGame(game, predictionsById.get(game.id))
    )
    const dayDate = DateTime.fromISO(day.date)

    return {
      date: day.date,
      isToday: day.date === todayIso,
      label: dayDate.toFormat('ccc LLL d').toUpperCase(),
      heading:
        `${dayDate.toFormat('ccc, LLL d')} · ${pluralizeGames(games.length)}`.toUpperCase(),
      title: toTitle(day.date, todayIso),
      summary: summarizeDay(games, day.date, todayIso),
      games,
      record: tallyRecord(games),
    }
  })
}

export function resolveSelectedDate(
  requested: string | undefined,
  slates: DaySlate[],
  todayIso: string
): string | undefined {
  const dates = slates.map((s) => s.date)
  if (requested && dates.includes(requested)) return requested
  if (dates.includes(todayIso)) return todayIso
  return dates[0]
}

// Today's most confident picks. Reads only today's slate, since stored
// predictions now run several days ahead
export function topPicks(
  slates: DaySlate[],
  todayIso: string,
  limit = 5
): SlateGame[] {
  const today = slates.find((s) => s.date === todayIso)
  if (!today) return []

  return today.games
    .filter((g) => g.pick !== null && g.pickProbability !== null)
    .sort((a, b) => (b.pickProbability ?? 0) - (a.pickProbability ?? 0))
    .slice(0, limit)
}
