import { DateTime } from 'luxon'
import { NHLGameDay, NHLGameWeek } from '~/types/game'

interface GetTodaysGamesResponse extends NHLGameWeek {}

export async function getThisWeeksGames() {
  /*
    Fetch the NHL schedule for the next 7 days, starting from today
  */
  const dt = DateTime.now()
  const res = await fetch(
    `https://api-web.nhle.com/v1/schedule/${dt.toISODate()}`
  )
  const games: GetTodaysGamesResponse = await res.json()
  return games
}

interface GetGamesByDateResponse extends NHLGameDay {}

export async function getDailyScoresByDate(date: string) {
  const dt = DateTime.fromISO(date)
  const res = await fetch(`https://api-web.nhle.com/v1/score/${dt.toISODate()}`)
  const games: GetGamesByDateResponse = await res.json()
  return games
}
