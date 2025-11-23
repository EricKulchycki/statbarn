import { Database } from '@/lib/db'
import { eloService } from '@/services/elo.service'
import { modelService } from '@/services/model.service'
import {
  CheckCircleIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/solid'
import { cn } from '@heroui/react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function ConfidenceSummaryCard() {
  const db = Database.getInstance()
  await db.connect()

  const totalGames = await eloService.countSeasonsGames(20252026)
  const avgConfidence = await modelService.getAverageConfidence(20252026)
  const highConfidenceUpsets = await modelService.getHighConfidenceUpsets(
    20252026,
    0.7
  )
  const correctPredictions =
    await eloService.countSeasonsCorrectPredictions(20252026)

  const mostConfidentTeam = await modelService.getMostConfidentTeam(20252026)
  const leastConfidentTeam = await modelService.getLeastConfidentTeam(20252026)

  const currentPercentage = (correctPredictions / totalGames) * 100

  return (
    <div className="bg-slate-900 rounded-xl shadow-lg p-6 w-full max-w-lg">
      <h2 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
        <ChartBarIcon className="w-6 h-6 text-blue-400" />
        Model Confidence Summary
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-slate-400">
            <ArrowTrendingUpIcon className="w-5 h-5 text-blue-400" />
            Avg. Confidence
          </span>
          <span className="text-2xl font-bold text-blue-400">
            {(avgConfidence * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-slate-400">
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
            Correct Predictions
          </span>
          <span className="font-bold text-green-400">
            {correctPredictions} / {totalGames}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-slate-400">
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
            Current Percentage
          </span>
          <span
            className={cn(
              'font-bold',
              currentPercentage >= 0.5 ? 'text-green-400' : 'text-red-400'
            )}
          >
            {((correctPredictions / totalGames) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-slate-400">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            High-Confidence Upsets
          </span>
          <span className="font-bold text-red-400">
            {highConfidenceUpsets.length}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-slate-400">
            <ArrowTrendingUpIcon className="w-5 h-5 text-blue-300" />
            Most Confident Team
          </span>
          <span className="font-bold text-blue-200">{mostConfidentTeam}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-slate-400">
            <ArrowTrendingDownIcon className="w-5 h-5 text-blue-300" />
            Least Confident Team
          </span>
          <span className="font-bold text-blue-200">{leastConfidentTeam}</span>
        </div>
      </div>
    </div>
  )
}
