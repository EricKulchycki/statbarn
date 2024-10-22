import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'

import { useLoaderData } from '@remix-run/react'
import { GameBanner } from '~/components/GameBanner'
import { getTodaysGames, GetTodaysGamesResponse } from '~/data/games'

export const meta: MetaFunction = () => {
  return [
    { title: '54Fighting' },
    { name: 'description', content: 'NHL Stat Lines' },
  ]
}

export async function loader() {
  const res = await getTodaysGames()
  const games: GetTodaysGamesResponse = await res.json()

  return json({ games })
}

export default function Index() {
  const { games } = useLoaderData<typeof loader>()

  return (
    <div>
      <GameBanner gamesThisWeek={games.gameWeek} />
    </div>
  )
}
