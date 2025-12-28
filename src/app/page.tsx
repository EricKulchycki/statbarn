import { Suspense } from 'react'
import { GamePredictionsWrapper } from '@/components/GamePredictions.server'
import { PlayerStatsWrapper } from '@/components/PlayerStats.server'
import { YesterdaysGameOutcomes } from '@/components/YesterdaysGameOutcomes/server'
import { Database } from '@/lib/db'
import { CollapsibleSection } from '@/components/CollapsibleSection'

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
    <div className="w-full max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-8 lg:py-8 mb-8">
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Game Predictions - Priority content, center column */}
        <div className="lg:col-span-2 lg:order-1">
          <Suspense fallback={<LoadingSkeleton />}>
            <YesterdaysGameOutcomes />
          </Suspense>
          <Suspense fallback={<LoadingSkeleton />}>
            <GamePredictionsWrapper />
          </Suspense>
        </div>

        {/* Player Stats - Right sidebar */}
        <div className="lg:col-span-1 lg:order-2">
          <CollapsibleSection
            title="Player Stats"
            defaultOpen={false}
            alwaysOpenOnDesktop={true}
          >
            <Suspense fallback={<LoadingSkeleton />}>
              <PlayerStatsWrapper />
            </Suspense>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  )
}
