import { DateTime } from 'luxon'
import { NHLGameDay } from '~/types/game'

interface GetTodaysGamesResponse {
  gameWeek: NHLGameDay[]
  numberOfGames: number
}

export async function getTodaysGames() {
  const dt = DateTime.now()
  const res = await fetch(
    `https://api-web.nhle.com/v1/schedule/${dt.toISODate()}`
  )
  const games: GetTodaysGamesResponse = await res.json()
  return games
}
