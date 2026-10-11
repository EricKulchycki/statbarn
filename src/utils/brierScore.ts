export interface ForecastOutcome {
  probability: number
  occurred: boolean
}

// Mean squared error between forecast probability and outcome (1 or 0).
// 0 is perfect; always forecasting 50% scores 0.25.
export function brierScore(forecasts: ForecastOutcome[]): number | null {
  if (forecasts.length === 0) return null

  const total = forecasts.reduce(
    (sum, { probability, occurred }) =>
      sum + (probability - (occurred ? 1 : 0)) ** 2,
    0
  )
  return total / forecasts.length
}
