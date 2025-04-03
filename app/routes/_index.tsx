import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { ELO } from '~/components/ELO'

import { GameBanner } from '~/components/GameBanner'
import { getTodaysGames } from '~/data/games'
import { fetchGamesForTeam } from '~/data/team-games.fetch'
import { getTeams } from '~/data/teams'

export const meta: MetaFunction = () => {
  return [
    { title: '54Fighting' },
    { name: 'description', content: 'NHL Stat Lines' },
  ]
}

export async function loader() {
  const games = await getTodaysGames()
  await getTeams()
  const seasonGames = await fetchGamesForTeam(
    games.gameWeek[0].games[0].homeTeam,
    '20232024'
  )

  return json({ games, seasonGames })
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
