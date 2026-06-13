'use client'

import { TeamSeasonGame } from '@/types/team'
import React from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ payload, active }: any) {
  if (active) {
    return (
      <div className="">
        <p className="label font-bold">{`Rating: ${payload[0].value.toFixed(0)}`}</p>
      </div>
    )
  }
  return null
}

interface ELOHistoryGraphProps {
  history: TeamSeasonGame[]
}

export const ELOHistoryGraph: React.FC<ELOHistoryGraphProps> = ({
  history,
}) => {
  const chartData = [...history].reverse().map((game) => ({
    date: new Date(game.gameDate).toLocaleDateString(),
    elo: game.outcome?.eloAfter ?? game.eloBefore,
    gameId: game.gameId,
  }))

  return (
    <div className="rounded-xl lg:p-6 h-full">
      <h2 className="text-2xl font-bold mb-6">Last 82 Games</h2>
      <div className="h-full bg-slate-900 p-2 rounded-2xl flex items-center">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#1d293d" strokeDasharray="5 5" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="elo"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
