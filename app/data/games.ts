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

interface GetGamesByDateResponse extends NHLGameDay {}

export async function getGamesByDate(date: string) {
  const dt = DateTime.fromISO(date)
  const res = await fetch(`https://api-web.nhle.com/v1/score/${dt.toISODate()}`)
  const games: GetGamesByDateResponse = await res.json()
  return games
}
