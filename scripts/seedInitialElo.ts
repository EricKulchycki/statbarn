import mongoose from 'mongoose'
import { Database } from '../src/lib/db'
import { TeamModel } from '../src/models/team'
import { ELO_CONFIG } from '../src/constants'

async function main() {
  const db = Database.getInstance()
  await db.connect()

  const result = await TeamModel.updateMany(
    {},
    { $set: { currentElo: ELO_CONFIG.initialRating } }
  )

  console.log(`Set currentElo to ${ELO_CONFIG.initialRating} on ${result.modifiedCount} teams.`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
