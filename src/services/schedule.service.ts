import { getLeagueSchedule, getScheduleByDate } from '@/data/schedule'
import { createApiError } from '@/types/errors'
import { NHLGameWeek } from '@/types/game'

export class ScheduleService {
  private static instance: ScheduleService

  private constructor() {}

  public static getInstance(): ScheduleService {
    if (!ScheduleService.instance) {
      ScheduleService.instance = new ScheduleService()
    }
    return ScheduleService.instance
  }

  async getCurrentSchedule(): Promise<NHLGameWeek> {
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

  async getScheduleByDate(date: string): Promise<NHLGameWeek> {
    try {
      const schedule = await getScheduleByDate(date)
      return schedule
    } catch (error) {
      throw createApiError(
        'getScheduleByDate',
        `Failed to fetch league schedule for date ${date}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

export const scheduleService = ScheduleService.getInstance()
