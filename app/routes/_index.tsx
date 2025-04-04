import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { calculateSeasonELO } from 'lib/elo'
import { ELO } from '~/components/ELO'

import { GameBanner } from '~/components/GameBanner'
import { getTodaysGames } from '~/data/games'
import { getTeams } from '~/data/teams'

export const meta: MetaFunction = () => {
  return [
    { title: '54Fighting' },
    { name: 'description', content: 'NHL Stat Lines' },
  ]
}

export async function loader() {
  const games = await getTodaysGames()
  const teams = await getTeams()

  const elos = await calculateSeasonELO('20142015', teams)
  console.log(elos)

  return json({ games })
}

export default function Index() {
  const gameFetcher = useLoaderData<typeof loader>()

  const games = gameFetcher?.games

  if (!games) return null

  return (
    <div>
      <GameBanner gamesThisWeek={games.gameWeek} />
      <ELO />
    </div>
  )
}
