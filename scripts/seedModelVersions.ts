import { DEFAULT_MODEL_PARAMS, ModelParams } from '@statbarn/prediction-core'
import mongoose from 'mongoose'
import { Database } from '../src/lib/db'
import { ModelVersionModel } from '../src/models/modelVersion'

// Records every released model version, so a fresh database matches
// production. Safe to re-run: existing versions are never overwritten.

const V2_DATE = new Date('2026-10-12T00:00:00Z')
const V3_DATE = new Date('2026-11-03T00:00:00Z')

const V3_NOTES =
  'Last-5 head-to-head Elo adjustment turned off (matchupMaxAdjustment 8 -> 0). Removing it changed backtest Brier by under 0.0001 (train 0.2390 -> 0.2390, holdout 0.2479 -> 0.2480), and it cost a database query per game.'

const v2Params: ModelParams = {
  ...DEFAULT_MODEL_PARAMS,
  matchupMaxAdjustment: 8,
}
const v1Params: ModelParams = { ...v2Params, kFactor: 32 }

const versions = [
  {
    version: 'v1',
    status: 'retired',
    params: v1Params,
    notes:
      'Original model. K=32 with goal-margin boost, +25 home advantage, one-third regression between seasons. Overconfident: 2025-26 Brier 0.2572.',
    retiredAt: V2_DATE,
  },
  {
    version: 'v2',
    status: 'retired',
    params: v2Params,
    basedOn: 'v1',
    notes:
      'K lowered from 32 to 8 after walk-forward backtests over 2023-26 (2025-26 Brier 0.2572 -> 0.2480). Forward only; history not recalculated.',
    activatedAt: V2_DATE,
    retiredAt: V3_DATE,
  },
  {
    version: 'v3',
    status: 'active',
    params: DEFAULT_MODEL_PARAMS,
    basedOn: 'v2',
    notes: V3_NOTES,
    activatedAt: V3_DATE,
  },
]

async function main() {
  await Database.getInstance().connect()
  await ModelVersionModel.createIndexes()

  for (const v of versions) {
    const result = await ModelVersionModel.updateOne(
      { version: v.version },
      { $setOnInsert: v },
      { upsert: true }
    )
    console.log(
      `${v.version}: ${result.upsertedCount ? 'created' : 'already exists, left unchanged'}`
    )
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
