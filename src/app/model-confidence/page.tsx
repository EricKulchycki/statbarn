import { ConfidenceSummaryCard } from '@/components/ConfidenceSummaryCard'
import { ConfidenceTrendChart } from '@/components/ConfidenceTrendChart'

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto py-8">
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
