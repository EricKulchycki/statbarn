import type { ModelParams } from '@statbarn/prediction-core'
import mongoose from 'mongoose'
import {
  createDraftModelVersion,
  getActiveModelVersion,
  getModelVersion,
  saveModelBacktest,
} from '../src/data/modelVersions'
import { getCompletedGamesAllSeasons } from '../src/data/teams'
import {
  backtestModel,
  BacktestRun,
  calibrationBuckets,
  ReplayGame,
} from '../src/lib/modelBacktest'
import { getCurrentNHLSeason } from '../src/utils/currentSeason'

const USAGE = `Usage: npm run model:backtest -- <version> [options]

Replays every stored game with a model's params and reports Brier scores
(lower is better; always guessing 50% scores 0.250).

Options:
  --set <param>=<value>   Try a variant, e.g. --set kFactor=6
                          --set marginOfVictory.enabled=false (repeatable)
  --save                  Store the results on <version> (not with --set)
  --save-as <version>     Store the variant as a new draft version
  --notes "<text>"        Notes for --save-as (required with it)`

interface Args {
  version: string
  overrides: string[]
  save: boolean
  saveAs?: string
  notes?: string
}

function parseArgs(argv: string[]): Args {
  const [version, ...rest] = argv
  if (!version || version.startsWith('--')) throw new Error(USAGE)

  const args: Args = { version, overrides: [], save: false }
  for (let i = 0; i < rest.length; i++) {
    const flag = rest[i]
    if (flag === '--save') {
      args.save = true
      continue
    }

    const value = rest[++i]
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`${flag} needs a value\n\n${USAGE}`)
    }
    if (flag === '--set') args.overrides.push(value)
    else if (flag === '--save-as') args.saveAs = value
    else if (flag === '--notes') args.notes = value
    else throw new Error(`Unknown option: ${flag}\n\n${USAGE}`)
  }

  if (args.save && args.overrides.length > 0) {
    throw new Error(
      '--save stores results on an existing version, whose params never change. Use --save-as for a variant.'
    )
  }
  if (args.saveAs && !args.notes) {
    throw new Error('--save-as needs --notes describing the change.')
  }
  return args
}

// Applies "a.b=value" overrides, refusing unknown params or type changes
function applyOverrides(base: ModelParams, overrides: string[]): ModelParams {
  const params = structuredClone(base)
  for (const override of overrides) {
    const [path, raw] = override.split('=')
    if (!path || raw === undefined) {
      throw new Error(`Bad --set "${override}"; expected param=value`)
    }

    const keys = path.split('.')
    const last = keys.pop()!
    let target = params as unknown as Record<string, unknown>
    for (const key of keys) {
      if (typeof target[key] !== 'object' || target[key] === null) {
        throw new Error(`Unknown param "${path}"`)
      }
      target = target[key] as Record<string, unknown>
    }

    const current = target[last]
    if (typeof current === 'number') {
      const n = Number(raw)
      if (!Number.isFinite(n)) throw new Error(`"${path}" must be a number`)
      target[last] = n
    } else if (typeof current === 'boolean') {
      if (raw !== 'true' && raw !== 'false') {
        throw new Error(`"${path}" must be true or false`)
      }
      target[last] = raw === 'true'
    } else {
      throw new Error(`Unknown param "${path}"`)
    }
  }
  return params
}

function splitSeasons(games: ReplayGame[]) {
  const currentSeason = Number(getCurrentNHLSeason())
  const completed = [...new Set(games.map((g) => g.season))]
    .filter((s) => s < currentSeason)
    .sort()
  return { currentSeason, holdoutSeason: completed.at(-1) ?? null }
}

const fmt = (n: number | null) => (n === null ? '  n/a ' : n.toFixed(4))

function report(label: string, run: BacktestRun, holdout: number | null) {
  const { backtest } = run
  console.log(`\n${label}`)
  for (const s of backtest.seasons) {
    const tag =
      s.season === backtest.holdoutSeason
        ? ' (holdout)'
        : backtest.trainSeasons.includes(s.season)
          ? ''
          : ' (in progress)'
    console.log(
      `  ${s.season}${tag.padEnd(14)} ${String(s.games).padStart(4)} games  Brier ${fmt(s.brier)}`
    )
  }
  console.log(
    `  train ${fmt(backtest.trainBrier)}  |  holdout ${fmt(backtest.holdoutBrier)}`
  )

  if (holdout === null) return
  console.log(`  Holdout calibration (favourite's win probability):`)
  const holdoutForecasts = run.forecasts.filter((f) => f.season === holdout)
  for (const b of calibrationBuckets(holdoutForecasts)) {
    console.log(
      `    ${(b.range[0] * 100).toFixed(0)}–${(b.range[1] * 100).toFixed(0)}%  ${String(b.games).padStart(4)} games  predicted ${(b.predicted * 100).toFixed(1)}%  won ${(b.actual * 100).toFixed(1)}%`
    )
  }
}

function describeChanges(base: ModelParams, next: ModelParams, prefix = '') {
  const changes: string[] = []
  for (const key of Object.keys(next) as (keyof ModelParams)[]) {
    const a = base[key]
    const b = next[key]
    if (typeof b === 'object') {
      changes.push(
        ...describeChanges(
          a as unknown as ModelParams,
          b as unknown as ModelParams,
          `${prefix}${key}.`
        )
      )
    } else if (a !== b) {
      changes.push(`${prefix}${key}: ${a} → ${b}`)
    }
  }
  return changes
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const base = await getModelVersion(args.version)
  if (!base) throw new Error(`No model version "${args.version}"`)
  const params = applyOverrides(base.params, args.overrides)
  const changes = describeChanges(base.params, params)

  const games = await getCompletedGamesAllSeasons()
  const split = splitSeasons(games)
  console.log(
    `${games.length} completed games; holdout ${split.holdoutSeason ?? 'none'}, in progress ${split.currentSeason}`
  )

  const label =
    changes.length > 0
      ? `${args.version} with ${changes.join(', ')}`
      : args.version
  const run = backtestModel(games, params, split)
  report(label, run, split.holdoutSeason)

  const active = await getActiveModelVersion()
  if (active && (active.version !== args.version || changes.length > 0)) {
    const baseline = backtestModel(games, active.params, split)
    report(`Active model ${active.version} (baseline)`, baseline, null)
    const delta = (a: number | null, b: number | null) =>
      a === null || b === null
        ? 'n/a'
        : (a - b >= 0 ? '+' : '') + (a - b).toFixed(4)
    console.log(
      `\nVs ${active.version}: train ${delta(run.backtest.trainBrier, baseline.backtest.trainBrier)}, holdout ${delta(run.backtest.holdoutBrier, baseline.backtest.holdoutBrier)} (negative is better)`
    )
  }

  if (args.save) {
    await saveModelBacktest(args.version, run.backtest)
    console.log(`\nSaved results on ${args.version}.`)
  }
  if (args.saveAs) {
    if (await getModelVersion(args.saveAs)) {
      throw new Error(`Version "${args.saveAs}" already exists`)
    }
    await createDraftModelVersion({
      version: args.saveAs,
      params,
      notes: args.notes!,
      basedOn: args.version,
      backtest: run.backtest,
    })
    console.log(
      `\nSaved draft ${args.saveAs}. Activate with: npm run model:activate -- ${args.saveAs}`
    )
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
