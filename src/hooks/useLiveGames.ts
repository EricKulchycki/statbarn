'use client'

import {
  LIVE_POLL_MS,
  LiveGame,
  LiveGamesResponse,
  liveSchedule,
  WatchedGame,
} from '@/lib/liveGames'
import { useEffect, useRef, useState } from 'react'

// The slate and banner both poll; reuse a response fetched in the last few
// seconds so one page makes one request per interval
const SHARE_WINDOW_MS = 5_000
let recent: { at: number; promise: Promise<LiveGame[]> } | null = null

function fetchLiveGames(): Promise<LiveGame[]> {
  if (recent && Date.now() - recent.at < SHARE_WINDOW_MS) return recent.promise

  const promise = fetch('/api/live')
    .then((res) => {
      if (!res.ok) throw new Error(`Live scores responded ${res.status}`)
      return res.json() as Promise<LiveGamesResponse>
    })
    .then((body) => body.games)
  recent = { at: Date.now(), promise }
  // A failed request shouldn't be reused by the other component
  promise.catch(() => {
    if (recent?.promise === promise) recent = null
  })
  return promise
}

// Live updates for the given games, keyed by game id. Polls only while a game
// is in progress (or due to start), pauses in background tabs, and stops once
// every game is final.
export function useLiveGames(games: WatchedGame[]): Map<number, LiveGame> {
  const [live, setLive] = useState<Map<number, LiveGame>>(() => new Map())

  // The poll loop reads current states from here, so live updates don't
  // restart it; a different set of games (e.g. another day) does
  const watchedRef = useRef(games)
  const gamesKey = games.map((g) => `${g.id}:${g.gameState}`).join(',')

  useEffect(() => {
    watchedRef.current = games
    let timer: ReturnType<typeof setTimeout> | undefined
    let stopped = false

    const schedule = () => {
      clearTimeout(timer)
      if (stopped) return
      const next = liveSchedule(watchedRef.current, Date.now())
      if (next.mode === 'live') timer = setTimeout(poll, LIVE_POLL_MS)
      else if (next.mode === 'waiting') timer = setTimeout(schedule, next.ms)
    }

    const poll = async () => {
      // Hidden tabs skip polling; onVisibilityChange resumes it
      if (document.visibilityState === 'hidden') return
      try {
        const updates = await fetchLiveGames()
        if (stopped) return
        const byId = new Map(updates.map((g) => [g.id, g]))

        watchedRef.current = watchedRef.current.map((g) => ({
          ...g,
          gameState: byId.get(g.id)?.gameState ?? g.gameState,
        }))
        setLive((prev) => {
          const next = new Map(prev)
          for (const g of watchedRef.current) {
            const update = byId.get(g.id)
            if (update) next.set(g.id, update)
          }
          return next
        })
      } catch (error) {
        // A network blip just means stale scores until the next poll
        console.warn(error)
      }
      schedule()
    }

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return
      const next = liveSchedule(watchedRef.current, Date.now())
      if (next.mode === 'live') poll()
      else schedule()
    }

    schedule()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      stopped = true
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
    // games is captured via gamesKey; the array itself is new every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamesKey])

  return live
}
