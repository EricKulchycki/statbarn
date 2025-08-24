import { getSeasons } from '~/data/season'
import { createApiError, createNotFoundError } from '~/types/errors'
import { Season } from '~/types/time'

export class SeasonService {
  private static instance: SeasonService

  private constructor() {}

  public static getInstance(): SeasonService {
    if (!SeasonService.instance) {
      SeasonService.instance = new SeasonService()
    }
    return SeasonService.instance
  }

  async getSeasonByYear(year: number): Promise<Season | null> {
    try {
      const seasons = await getSeasons()
      const season = seasons.find((season) => Number(season) === year)
      if (!season) {
        throw createNotFoundError('Season', year.toString())
      }
      return season
    } catch (error) {
      throw createApiError(
        'getSeasonByYear',
        `Failed to fetch season for year ${year}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // async getAllSeasons(): Promise<Season[]> {
  //   try {
  //     const seasons = await getSeasonData()
  //     if (!seasons || seasons.length === 0) {
  //       throw createNotFoundError('Seasons', 'all')
  //     }
  //     return seasons
  //   } catch (error) {
  //     throw createApiError(
  //       'getAllSeasons',
  //       `Failed to fetch all seasons: ${error instanceof Error ? error.message : 'Unknown error'}`
  //     )
  //   }
  // }
}

// Export singleton instance
export const seasonService = SeasonService.getInstance()
