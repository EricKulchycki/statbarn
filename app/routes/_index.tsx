import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { calculateSeasonELO } from 'lib/elo'
import { getCurrentNHLSeason } from 'utils/currentSeason'
import { ELO } from '~/components/ELO'

import { GameBanner } from '~/components/GameBanner'
import { GamePredictions } from '~/components/GamePredictions'
import { getTodaysGames } from '~/data/games'
import { getLatestEloData } from '~/data/latest-elo.get'
import { getTeams } from '~/data/teams'

export const meta: MetaFunction = () => {
  return [
    { title: 'bethow' },
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
      <div className="flex flex-col md:flex-row">
        <ELO elos={elos} teams={teams} />
        <div>
          <GamePredictions
            dayLabel="Today"
            todaysGames={games.gameWeek[0]}
            elos={elos}
          />
          <GamePredictions
            dayLabel="Tomorrow"
            todaysGames={games.gameWeek[1]}
            elos={elos}
          />
        </div>
      </div>
    </div>
  )
}
