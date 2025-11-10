import { ConfidenceSummaryCard } from '@/components/ConfidenceSummaryCard'
import { ConfidenceTrendChart } from '@/components/ConfidenceTrendChart'
import { Database } from '@/lib/db'

export default async function Page() {
  const db = Database.getInstance()
  await db.connect()
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Model Confidence Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <ConfidenceSummaryCard />
        <ConfidenceTrendChart />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* <ConfidenceBucketAccuracyChart /> */}
        {/* <HighConfidenceUpsetsList /> */}
      </div>
      {/* <TeamConfidenceTable /> */}
    </div>
  )
}
