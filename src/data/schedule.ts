import { NHLGameWeek } from '@/types/game'

export async function getLeagueSchedule(): Promise<NHLGameWeek> {
  const url = 'https://api-web.nhle.com/v1/schedule/now'

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch league schedule: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}
