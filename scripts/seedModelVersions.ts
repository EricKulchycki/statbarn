import { DEFAULT_MODEL_PARAMS, ModelParams } from '@statbarn/prediction-core'
import mongoose from 'mongoose'
import { Database } from '../src/lib/db'
import { ModelVersionModel } from '../src/models/modelVersion'

// Records the two models that existed before versions were stored. Safe to
// re-run: existing versions are never overwritten.

const V2_DATE = new Date('2026-10-12T00:00:00Z')

const v1Params: ModelParams = { ...DEFAULT_MODEL_PARAMS, kFactor: 32 }

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
    status: 'active',
    params: DEFAULT_MODEL_PARAMS,
    basedOn: 'v1',
    notes:
      'K lowered from 32 to 8 after walk-forward backtests over 2023-26 (2025-26 Brier 0.2572 -> 0.2480). Forward only; history not recalculated.',
    activatedAt: V2_DATE,
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
