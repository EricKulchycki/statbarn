import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { eloService } from '~/services/elo.service'
import { gameService } from '~/services/game.service'
import { ELO } from '~/components/ELO'
import { GameBanner } from '~/components/GameBanner'
import { GamePredictions } from '~/components/GamePredictions'
import { getTeams } from '~/data/teams'
import { APP_CONFIG } from '~/constants'
import { Prediction } from 'models/prediction'

export const meta: MetaFunction = () => {
  return [
    { title: APP_CONFIG.name },
    { name: 'description', content: APP_CONFIG.description },
  ]
}

export async function loader() {
  try {
    // Fetch data using service layer
    const [thisWeeksGames, teams, latestElos] = await Promise.all([
      gameService.getThisWeeksGames(),
      getTeams(),
      eloService.getLatestElos(),
      // gameService.getPredictionsForDate(getYesterdayDate()),
    ])

    return json({
      thisWeeksGames,
      teams,
      yesterdaysGames: thisWeeksGames[0] || [],
      latestElos,
      yesterdaysPredictions: [],
    })
  } catch (error) {
    // Log error for debugging
    console.error('Error in index loader:', error)

    // Return error response that can be handled by error boundary
    throw new Response(
      JSON.stringify({
        message: 'Failed to load game data',
        status: 500,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

  const {
    thisWeeksGames,
    yesterdaysGames,
    latestElos,
    teams,
    yesterdaysPredictions,
  } = data

  // Transform predictions to include proper date objects
  const transformedPredictions = yesterdaysPredictions?.map(
    (prediction: Prediction) => ({
      ...prediction,
      gameDate: new Date(prediction.gameDate),
    })
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GameBanner gamesThisWeek={thisWeeksGames} />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ELO Rankings */}
        <div className="lg:col-span-1">
          <ELO elos={latestElos} teams={teams} />
        </div>

        {/* Game Predictions */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <GamePredictions
            dayLabel="Yesterday"
            todaysGames={yesterdaysGames}
            elos={latestElos}
            predictions={transformedPredictions}
          />
          <GamePredictions
            dayLabel="Today"
            todaysGames={thisWeeksGames[0]}
            elos={latestElos}
          />
          <GamePredictions
            dayLabel="Tomorrow"
            todaysGames={thisWeeksGames[1]}
            elos={latestElos}
          />
        </div>
      </div>
    </div>
  )
}
