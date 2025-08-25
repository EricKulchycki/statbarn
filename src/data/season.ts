import { Season } from '@/types/time'

export async function getSeasons(): Promise<Season[]> {
  const res = await fetch('https://api-web.nhle.com/v1/season')
  if (!res.ok) {
    throw new Error('Failed to fetch seasons')
  }
  const data = await res.json()
  console.log(data)
  return data
}
