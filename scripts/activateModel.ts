import mongoose from 'mongoose'
import {
  activateModelVersion,
  getActiveModelVersion,
  getModelVersion,
} from '../src/data/modelVersions'

// Makes a version the one the nightly crons use. Takes effect from the next
// prediction and outcome runs; stored history is never recalculated.

async function main() {
  const version = process.argv[2]
  if (!version) {
    throw new Error('Usage: npm run model:activate -- <version>')
  }

  const next = await getModelVersion(version)
  if (!next) throw new Error(`No model version "${version}"`)
  if (next.status === 'active') {
    console.log(`${version} is already active.`)
    return
  }
  if (!next.backtest) {
    throw new Error(
      `${version} has no backtest. Run: npm run model:backtest -- ${version} --save`
    )
  }

  const current = await getActiveModelVersion()
  await activateModelVersion(version)

  console.log(
    `Activated ${version}${current ? ` (retired ${current.version})` : ''}.`
  )
  console.log(
    `Holdout Brier: ${next.backtest.holdoutBrier?.toFixed(4) ?? 'n/a'}` +
      (current?.backtest
        ? ` vs ${current.version} ${current.backtest.holdoutBrier?.toFixed(4) ?? 'n/a'}`
        : '')
  )
  console.log('Add an entry to docs/MODEL_CHANGELOG.md.')
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
