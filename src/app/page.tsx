import { Suspense } from 'react'
import { ELOWrapper } from '@/components/ELO.server'
import { GamePredictionsWrapper } from '@/components/GamePredictions.server'
import { PlayerStatsWrapper } from '@/components/PlayerStats.server'
import { YesterdaysGameOutcomes } from '@/components/YesterdaysGameOutcomes/server'
import { Database } from '@/lib/db'

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      <div className="h-16 bg-gray-200 rounded"></div>
      <div className="h-16 bg-gray-200 rounded"></div>
      <div className="h-16 bg-gray-200 rounded w-5/6"></div>
    </div>
  )
}

export default async function Index() {
  const db = Database.getInstance()
  await db.connect()
  return (
    <div className="lg:max-w-7/10 mx-auto px-4 sm:px-6 lg:px-8 lg:py-8 mb-8">
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ELO Rankings */}
        <div className="lg:col-span-1">
          <Suspense fallback={<LoadingSkeleton />}>
            <ELOWrapper />
          </Suspense>
        </div>

        {/* Game Predictions */}
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingSkeleton />}>
            <YesterdaysGameOutcomes />
          </Suspense>
          <Suspense fallback={<LoadingSkeleton />}>
            <GamePredictionsWrapper />
          </Suspense>
        </div>

        <div className="lg:col-span-1">
          <Suspense fallback={<LoadingSkeleton />}>
            <PlayerStatsWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
