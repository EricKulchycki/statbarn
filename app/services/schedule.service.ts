import { getLeagueSchedule } from '~/data/schedule'
import { createApiError } from '~/types/errors'

export class ScheduleService {
  private static instance: ScheduleService

  private constructor() {}

  public static getInstance(): ScheduleService {
    if (!ScheduleService.instance) {
      ScheduleService.instance = new ScheduleService()
    }
    return ScheduleService.instance
  }

  async getCurrentSchedule() {
    try {
      const schedule = await getLeagueSchedule()
      return schedule
    } catch (error) {
      throw createApiError(
        'getCurrentSchedule',
        `Failed to fetch current league schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

export const scheduleService = ScheduleService.getInstance()
