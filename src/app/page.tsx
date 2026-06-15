import { CollapsibleSection } from '@/components/CollapsibleSection'
import { DashboardHeader } from '@/components/DashboardHeader.server'
import { GamePredictionsWrapper } from '@/components/GamePredictions.server'
import { PredictionsSidebar } from '@/components/PredictionsSidebar.server'
import { YesterdaysGameOutcomes } from '@/components/YesterdaysGameOutcomes/server'
import { Suspense } from 'react'

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
  return (
    <div className="w-full max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-8 lg:py-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="lg:col-span-2 lg:order-1">
          <Suspense
            fallback={
              <div className="h-20 animate-pulse bg-slate-800/40 rounded-lg mb-6" />
            }
          >
            <DashboardHeader />
          </Suspense>
          <Suspense fallback={<LoadingSkeleton />}>
            <GamePredictionsWrapper />
          </Suspense>

          <Suspense fallback={<LoadingSkeleton />}>
            <YesterdaysGameOutcomes />
          </Suspense>
        </div>

        <div className="lg:col-span-1 lg:order-2">
          <CollapsibleSection
            title="Predictions"
            defaultOpen={false}
            alwaysOpenOnDesktop={true}
          >
            <Suspense fallback={<LoadingSkeleton />}>
              <PredictionsSidebar />
            </Suspense>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  )
}
