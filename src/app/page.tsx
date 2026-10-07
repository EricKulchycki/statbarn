import { CollapsibleSection } from '@/components/CollapsibleSection'
import { DayNav, DayNavSkeleton } from '@/components/DayNav.server'
import { DaySlate } from '@/components/DaySlate.server'
import { PredictionsSidebar } from '@/components/PredictionsSidebar.server'
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

interface Props {
  searchParams: Promise<{ date?: string | string[] }>
}

export default async function Index({ searchParams }: Props) {
  const { date } = await searchParams
  const requestedDate = typeof date === 'string' ? date : undefined

  return (
    <>
      <div className="border-b border-slate-800">
        <div className="w-full max-w-[1900px] mx-auto px-0 sm:px-2 lg:px-4">
          <Suspense fallback={<DayNavSkeleton />}>
            <DayNav requestedDate={requestedDate} />
          </Suspense>
        </div>
      </div>

      <div className="w-full max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-8 lg:py-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <div className="lg:col-span-2 lg:order-1">
            <Suspense fallback={<LoadingSkeleton />}>
              <DaySlate requestedDate={requestedDate} />
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
    </>
  )
}
