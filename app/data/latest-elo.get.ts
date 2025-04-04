import { SeasonELODocument, SeasonELOModel } from 'models/elo'
import { Database } from '../../lib/db'
import { SeasonELO } from '~/types/elo'

export async function getLatestEloData(): Promise<SeasonELO[]> {
  const db = Database.getInstance()

  try {
    // Connect to the database
    await db.connect()

    // Get the current year
    const currentYear = new Date().getFullYear()

    // Fetch the latest ELO data by season
    const latestSeason: SeasonELODocument[] = await SeasonELOModel.find()
      .where('season.endYear')
      .equals(currentYear - 1)
      .sort({ 'season.endYear': -1, elo: -1 }) // Sort by the latest season
      .exec()

    if (!latestSeason.length) {
      console.log('No ELO data found.')
      return []
    }

    return latestSeason.map((elo) => ({
      abbrev: elo.abbrev,
      elo: elo.elo,
      season: {
        startYear: elo.season.startYear,
        endYear: elo.season.endYear,
      },
    }))
  } catch (error) {
    console.error('Error fetching latest ELO data:', error)
    throw error
  } finally {
    // Disconnect from the database
    db.disconnect()
  }
}
