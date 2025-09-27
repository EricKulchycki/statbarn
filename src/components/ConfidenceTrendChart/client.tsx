'use client'
import { ChartBarIcon } from '@heroicons/react/24/solid'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ConfidenceTrendChartProps {
  confidenceTrend: { date: string; avgConfidence: number }[]
}

export function ConfidenceTrendChart(props: ConfidenceTrendChartProps) {
  return (
    <div className="bg-slate-900 rounded-xl shadow-lg p-6 w-full max-w-lg">
      <h2 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
        <ChartBarIcon className="w-6 h-6 text-blue-400" />
        Confidence Trend (Last 7 Days)
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={props.confidenceTrend}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => d.slice(5)}
            stroke="#94a3b8"
            fontSize={12}
          />
          <YAxis
            domain={[0.6, 0.8]}
            tickFormatter={(v) => `${Math.round(v * 100)}%`}
            stroke="#94a3b8"
            fontSize={12}
          />
          <Tooltip
            formatter={(v) => `${Math.round(Number(v.valueOf()) * 100)}%`}
          />
          <Line
            type="monotone"
            dataKey="avgConfidence"
            stroke="#38bdf8"
            strokeWidth={3}
            dot={{ r: 5, fill: '#38bdf8' }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
