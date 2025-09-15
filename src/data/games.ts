import { DateTime } from 'luxon'
import { NHLGameDay, NHLGameWeek } from '@/types/game'

type GetTodaysGamesResponse = NHLGameWeek

export async function getThisWeeksGames() {
  /*
    Fetch the NHL schedule for the next 7 days, starting from today
  */
  const tomorrow = DateTime.now().plus({ days: 1 })
  const res = await fetch(
    `https://api-web.nhle.com/v1/schedule/${tomorrow.toISODate()}`
  )
  const games: GetTodaysGamesResponse = await res.json()
  return games
}

type GetGamesByDateResponse = NHLGameDay

export async function getDailyScoresByDate(date: string) {
  const dt = DateTime.fromISO(date)
  const res = await fetch(`https://api-web.nhle.com/v1/score/${dt.toISODate()}`)
  const games: GetGamesByDateResponse = await res.json()
  return games
}
