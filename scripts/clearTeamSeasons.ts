import mongoose from 'mongoose'
import { ELO_CONFIG } from '../src/constants'
import { Database } from '../src/lib/db'
import { TeamModel } from '../src/models/team'

async function main() {
  const confirmed = process.argv.includes('--confirm')

  if (!confirmed) {
    console.error(
      'This will permanently delete all seasons and eloResets from every team document.'
    )
    console.error('Re-run with --confirm to proceed.')
    process.exit(1)
  }

  const db = Database.getInstance()
  await db.connect()

  const result = await TeamModel.updateMany(
    {},
    { $set: { seasons: [], eloResets: [], currentElo: ELO_CONFIG.initialRating } }
  )

  console.log(`Cleared seasons and eloResets, reset currentElo to ${ELO_CONFIG.initialRating} on ${result.modifiedCount} teams.`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
