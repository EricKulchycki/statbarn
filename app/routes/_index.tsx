import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { calculateSeasonELO } from 'lib/elo'
import { getCurrentNHLSeason } from 'utils/currentSeason'
import { ELO } from '~/components/ELO'

import { GameBanner } from '~/components/GameBanner'
import { getTodaysGames } from '~/data/games'
import { getLatestEloData } from '~/data/latest-elo.get'
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
  const lastSeasonElos = await getLatestEloData()

  const elos = await calculateSeasonELO(
    getCurrentNHLSeason(),
    teams,
    lastSeasonElos
  )

  return json({ games, elos, teams })
}

export default function Index() {
  const gameFetcher = useLoaderData<typeof loader>()

  const games = gameFetcher?.games
  const elos = gameFetcher?.elos
  const teams = gameFetcher?.teams

  if (!games) return null

  return (
    <div>
      <GameBanner gamesThisWeek={games.gameWeek} />
      <ELO elos={elos} teams={teams} />
    </div>
  )
}
