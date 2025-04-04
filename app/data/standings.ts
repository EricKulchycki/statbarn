import { Standing } from '~/types/standings'

export async function getStandings(): Promise<Standing[]> {
  const res = await fetch('https://api-web.nhle.com/v1/standings/now')
  const standings = await res.json()
  return standings.standings as Standing[]
}
