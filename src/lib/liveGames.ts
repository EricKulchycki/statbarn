import { NHLGame } from '@/types/game'
import { GameStatus, isFinal, isLive } from '@/utils/game'

// The few fields that change while a game is played. Everything else on the
// page (teams, predictions, start times) is fixed once a game starts.
export interface LiveGame {
  id: number
  gameState: GameStatus
  awayScore: number | null
  homeScore: number | null
  periodType: string | null
}

export interface LiveGamesResponse {
  fetchedAt: string
  games: LiveGame[]
}

// Shape of a game in the NHL /v1/score feed (only the fields we read)
export interface NHLScoreGame {
  id: number
  gameState: GameStatus
  awayTeam: { score?: number }
  homeTeam: { score?: number }
  periodDescriptor?: { periodType?: string }
}

export function toLiveGame(game: NHLScoreGame): LiveGame {
  return {
    id: game.id,
    gameState: game.gameState,
    awayScore: game.awayTeam.score ?? null,
    homeScore: game.homeTeam.score ?? null,
    periodType: game.periodDescriptor?.periodType ?? null,
  }
}

// Overlays a live update on a schedule game, for components that render
// NHLGame directly (the banner)
export function applyLiveGame(game: NHLGame, live?: LiveGame): NHLGame {
  if (!live) return game
  return {
    ...game,
    gameState: live.gameState,
    awayTeam: {
      ...game.awayTeam,
      score: live.awayScore ?? game.awayTeam.score,
    },
    homeTeam: {
      ...game.homeTeam,
      score: live.homeScore ?? game.homeTeam.score,
    },
  }
}

// ---- When to poll ----

export const LIVE_POLL_MS = 30_000
// Upper bound on a single wait, so a long gap before the first game still
// re-checks occasionally
const MAX_WAIT_MS = 30 * 60_000
// A game this long past its start without going live is treated as postponed
const STALE_START_MS = 6 * 60 * 60_000

export interface WatchedGame {
  id: number
  gameState: GameStatus
  startTimeUTC: string
}

export type LiveSchedule =
  | { mode: 'live' }
  | { mode: 'waiting'; ms: number }
  | { mode: 'idle' }

// Poll while any game is in progress or should have started; otherwise wait
// for the next start time; stop once nothing is left to watch.
export function liveSchedule(games: WatchedGame[], now: number): LiveSchedule {
  let nextStart = Infinity

  for (const game of games) {
    if (isLive(game.gameState)) return { mode: 'live' }
    if (isFinal(game.gameState)) continue

    const start = Date.parse(game.startTimeUTC)
    if (start <= now) {
      if (now - start < STALE_START_MS) return { mode: 'live' }
    } else {
      nextStart = Math.min(nextStart, start)
    }
  }

  if (nextStart === Infinity) return { mode: 'idle' }
  return { mode: 'waiting', ms: Math.min(nextStart - now, MAX_WAIT_MS) }
}
