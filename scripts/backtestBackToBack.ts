import { predictGame } from '@statbarn/prediction-core'
import mongoose from 'mongoose'
import { getSeasonGamesByTeam } from '../src/data/teams'
import {
  MAX_B2B_ADJUSTMENT,
  backToBackEloAdjustment,
  markBackToBacks,
} from '../src/lib/backToBack'
import { ForecastOutcome, brierScore } from '../src/utils/brierScore'

// Walk-forward backtest: does a per-team back-to-back factor improve on the
// v1 Elo model? Each factor only uses back-to-backs played earlier in the
// season, so no game is predicted with knowledge of its own result.
//
// The v1 baseline is rebuilt from each team's stored pre-game Elo rather than
// read from stored predictions, since seeded seasons may not reflect Elo.

const seasonArg = process.argv[2]
if (!seasonArg || !/^\d{8}$/.test(seasonArg)) {
  console.error(
    'Usage: tsx scripts/backtestBackToBack.ts <YYYYYYYY> (e.g. 20252026)'
  )
  process.exit(1)
}
const SEASON = parseInt(seasonArg)
const CAPS = [25, MAX_B2B_ADJUSTMENT, 100]

interface ReplayGame {
  gameDate: Date
  home: string
  away: string
  homeProbV1: number
  homeWon: boolean
  homeB2B: boolean
  awayB2B: boolean
}

interface RunningB2B {
  games: number
  wins: number
  expectedWins: number
}

const toElo = (p: number) => 400 * Math.log10(p / (1 - p))
const fromElo = (d: number) => 1 / (1 + Math.pow(10, -d / 400))

async function loadReplayGames(): Promise<ReplayGame[]> {
  const teams = await getSeasonGamesByTeam(SEASON)

  const backToBacks = new Set<string>()
  const eloBefore = new Map<string, number>()
  for (const { triCode, games } of teams) {
    for (const g of markBackToBacks(games)) {
      if (g.isBackToBack) backToBacks.add(`${triCode}:${g.gameId}`)
    }
    for (const g of games) eloBefore.set(`${triCode}:${g.gameId}`, g.eloBefore)
  }

  return teams
    .flatMap(({ triCode, games }) =>
      games
        .filter(
          (g) =>
            g.isHome && g.outcome && eloBefore.has(`${g.opponent}:${g.gameId}`)
        )
        .map((g) => ({
          gameDate: new Date(g.gameDate),
          home: triCode,
          away: g.opponent,
          homeProbV1: predictGame({
            homeAbbrev: triCode,
            awayAbbrev: g.opponent,
            homeElo: g.eloBefore,
            awayElo: eloBefore.get(`${g.opponent}:${g.gameId}`)!,
          }).homeWinProbability,
          homeWon: g.outcome!.actualWin,
          homeB2B: backToBacks.has(`${triCode}:${g.gameId}`),
          awayB2B: backToBacks.has(`${g.opponent}:${g.gameId}`),
        }))
    )
    .sort((a, b) => a.gameDate.getTime() - b.gameDate.getTime())
}

function replay(games: ReplayGame[], cap: number) {
  const running = new Map<string, RunningB2B>()
  const factorFor = (team: string, onB2B: boolean) => {
    const r = running.get(team)
    if (!onB2B || !r || r.games === 0) return 0
    return backToBackEloAdjustment((r.wins - r.expectedWins) / r.games, cap)
  }
  const record = (team: string, won: boolean, expected: number) => {
    const r = running.get(team) ?? { games: 0, wins: 0, expectedWins: 0 }
    running.set(team, {
      games: r.games + 1,
      wins: r.wins + (won ? 1 : 0),
      expectedWins: r.expectedWins + expected,
    })
  }

  const v1: ForecastOutcome[] = []
  const v2: ForecastOutcome[] = []
  const v1B2B: ForecastOutcome[] = []
  const v2B2B: ForecastOutcome[] = []

  for (const g of games) {
    const p = Math.min(0.999, Math.max(0.001, g.homeProbV1))
    const adjusted = fromElo(
      toElo(p) + factorFor(g.home, g.homeB2B) - factorFor(g.away, g.awayB2B)
    )

    v1.push({ probability: g.homeProbV1, occurred: g.homeWon })
    v2.push({ probability: adjusted, occurred: g.homeWon })
    if (g.homeB2B || g.awayB2B) {
      v1B2B.push({ probability: g.homeProbV1, occurred: g.homeWon })
      v2B2B.push({ probability: adjusted, occurred: g.homeWon })
    }

    // Results only become known after the game is predicted
    if (g.homeB2B) record(g.home, g.homeWon, g.homeProbV1)
    if (g.awayB2B) record(g.away, !g.homeWon, 1 - g.homeProbV1)
  }

  return {
    games: v1.length,
    b2bGames: v1B2B.length,
    v1: brierScore(v1),
    v2: brierScore(v2),
    v1B2B: brierScore(v1B2B),
    v2B2B: brierScore(v2B2B),
  }
}

const fmt = (n: number | null) => (n === null ? '  n/a ' : n.toFixed(4))

async function main() {
  const games = await loadReplayGames()
  if (games.length === 0) {
    console.log(`No completed games for ${SEASON}.`)
    return
  }

  console.log(`Back-to-back backtest, season ${SEASON}`)
  for (const cap of CAPS) {
    const r = replay(games, cap)
    const verdict = r.v2! < r.v1! ? 'v2 better' : 'v1 better or equal'
    console.log(
      `\ncap ±${cap} Elo${cap === MAX_B2B_ADJUSTMENT ? ' (default)' : ''}` +
        `\n  all games (${r.games}):  v1 ${fmt(r.v1)}  v2 ${fmt(r.v2)}  Δ ${(r.v2! - r.v1!).toFixed(4)}  → ${verdict}` +
        `\n  B2B games (${r.b2bGames}):  v1 ${fmt(r.v1B2B)}  v2 ${fmt(r.v2B2B)}  Δ ${(r.v2B2B! - r.v1B2B!).toFixed(4)}`
    )
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
