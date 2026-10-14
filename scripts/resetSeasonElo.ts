import mongoose from 'mongoose'
import { regressToMean } from '@statbarn/prediction-core'
import { Database } from '../src/lib/db'
import { TeamModel } from '../src/models/team'
import { getActiveModel } from '../src/services/modelVersion.service'

async function main() {
  const seasonArg = process.argv[2]
  if (!seasonArg || !/^\d{8}$/.test(seasonArg)) {
    console.error(
      'Usage: tsx scripts/resetSeasonElo.ts <YYYYYYY> (e.g. 20242025)'
    )
    process.exit(1)
  }

  const db = Database.getInstance()
  await db.connect()
  const { version, params } = await getActiveModel()
  console.log(`Regressing with model ${version}`)

  const teams = await TeamModel.find({}, { triCode: 1, currentElo: 1 })

  const resetDate = new Date()
  const reason = `offseason-${seasonArg}`
  const nextSeasonStart = parseInt(seasonArg.slice(4))
  const nextSeason = nextSeasonStart * 10000 + (nextSeasonStart + 1)
  let updated = 0

  for (const team of teams) {
    const fromElo = team.currentElo ?? params.initialRating
    const toElo = regressToMean(fromElo, params)

    await TeamModel.updateOne(
      { _id: team._id },
      {
        $set: { currentElo: toElo, 'seasons.$[s].startElo': toElo },
        $push: { eloResets: { date: resetDate, reason, fromElo, toElo } },
      },
      { arrayFilters: [{ 's.season': nextSeason }] }
    )

    console.log(
      `  ${team.triCode}: ${fromElo.toFixed(1)} → ${toElo.toFixed(1)}`
    )
    updated++
  }

  await mongoose.disconnect()
  console.log(
    `\nReset ${updated} teams (factor: ${params.meanRegressionFactor}, season: ${seasonArg})`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
