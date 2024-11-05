import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { GameBanner } from '~/components/GameBanner'
import { getTodaysGames } from '~/data/games'

export const meta: MetaFunction = () => {
  return [
    { title: '54Fighting' },
    { name: 'description', content: 'NHL Stat Lines' },
  ]
}

export async function loader() {
  const games = await getTodaysGames()

  return json({ games })
}

export default function Index() {
  const gameFetcher = useLoaderData<typeof loader>()

  const games = gameFetcher?.games

  if (!games) return null

  return (
    <div>
      <GameBanner gamesThisWeek={games.gameWeek} />
    </div>
  )
}
