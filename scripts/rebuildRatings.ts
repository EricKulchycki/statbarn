import mongoose from 'mongoose'
import {
  getCompletedGamesAllSeasons,
  getLatestEloData,
  resetTeamElo,
} from '../src/data/teams'
import { backtestModel } from '../src/lib/modelBacktest'
import { getActiveModel } from '../src/services/modelVersion.service'
import { getCurrentNHLSeason } from '../src/utils/currentSeason'

// Rebuilds every team's current rating by replaying all completed games
// under the active model, as if it had been in use from the start. Only
// currentElo changes (logged in eloResets); stored games, outcomes and
// predictions are untouched. The next nightly run re-predicts upcoming
// games and refreshes system picks from the new ratings.
//
// Dry run by default. Don't apply while the 06:00–07:00 UTC crons run.

const USAGE = 'Usage: npm run model:rebuild-ratings [-- --apply]'

// Smaller changes are rounding noise, not worth a reset entry
const MIN_CHANGE = 0.05

async function main() {
  const flags = process.argv.slice(2)
  const unknown = flags.filter((f) => f !== '--apply')
  if (unknown.length > 0)
    throw new Error(`Unknown option ${unknown[0]}\n\n${USAGE}`)
  const apply = flags.includes('--apply')

  const { version, params } = await getActiveModel()
  const games = await getCompletedGamesAllSeasons()
  const { ratings } = backtestModel(games, params, {
    holdoutSeason: null,
    currentSeason: null,
  })

  const season = Number(getCurrentNHLSeason())
  const activeTeams = new Set(
    games.filter((g) => g.season === season).flatMap((g) => [g.home, g.away])
  )
  if (activeTeams.size === 0) {
    throw new Error(`No completed ${season} games to rebuild from`)
  }

  const live = new Map((await getLatestEloData()).map((e) => [e.abbrev, e.elo]))
  const rows = [...activeTeams]
    .map((team) => ({
      team,
      from: live.get(team) ?? params.initialRating,
      to: ratings[team],
    }))
    .sort((a, b) => b.to - a.to)

  console.log(
    `Replayed ${games.length} games under ${version}; rebuilding ${rows.length} teams active in ${season}\n`
  )
  console.log('  Team    Live  Rebuilt  Change')
  for (const { team, from, to } of rows) {
    const change = to - from
    console.log(
      `  ${team}  ${from.toFixed(1).padStart(6)}  ${to.toFixed(1).padStart(7)}  ${(change >= 0 ? '+' : '') + change.toFixed(1)}`
    )
  }
  const spread = (values: number[]) =>
    Math.sqrt(
      values.reduce((sum, v) => sum + (v - params.initialRating) ** 2, 0) /
        values.length
    ).toFixed(1)
  console.log(
    `\n  Spread (SD from ${params.initialRating}): live ${spread(rows.map((r) => r.from))}, rebuilt ${spread(rows.map((r) => r.to))}`
  )

  const changed = rows.filter((r) => Math.abs(r.to - r.from) >= MIN_CHANGE)
  if (!apply) {
    console.log(
      `\nDry run: ${changed.length} teams would change. Re-run with --apply to write them.`
    )
    return
  }

  const date = new Date()
  const reason = `rebuild-${version}`
  for (const { team, to } of changed) {
    await resetTeamElo(team, to, reason, date)
  }

  // The stored ratings must now be exactly the replay's
  const stored = new Map(
    (await getLatestEloData()).map((e) => [e.abbrev, e.elo])
  )
  const mismatched = rows.filter(
    (r) => Math.abs((stored.get(r.team) ?? NaN) - r.to) >= MIN_CHANGE
  )
  if (mismatched.length > 0) {
    throw new Error(
      `Stored ratings differ from the replay for ${mismatched.map((r) => r.team).join(', ')}`
    )
  }
  console.log(
    `\nApplied: ${changed.length} teams reset (reason "${reason}"); all ${rows.length} verified against the replay.`
  )
  console.log(
    'The next nightly run re-predicts upcoming games. Add an entry to docs/MODEL_CHANGELOG.md.'
  )
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
