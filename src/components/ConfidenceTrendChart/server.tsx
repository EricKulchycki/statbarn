import { modelService } from '@/services/model.service'
import { ConfidenceTrendChart as ConfidenceTrendChartClient } from './client'

export async function ConfidenceTrendChart() {
  const confidenceTrend = await modelService.getModelConfidenceTrend(20252026)

  return <ConfidenceTrendChartClient confidenceTrend={confidenceTrend} />
}
