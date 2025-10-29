'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { deserializeUpset, SerializedUpset } from '@/utils/converters/upset'

export function UpsetByWeekChart({
  serializedUpsets,
}: {
  serializedUpsets: SerializedUpset[]
}) {
  const upsets = serializedUpsets.map(deserializeUpset)
  // Group upsets by ISO week
  const weekCounts: Record<string, number> = {}
  upsets.forEach((u) => {
    const dt = u.date
    const week = `${dt.year}-W${dt.weekNumber.toString().padStart(2, '0')}`
    weekCounts[week] = (weekCounts[week] || 0) + 1
  })

  // Prepare data for chart
  const data = Object.entries(weekCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({
      week,
      count,
    }))

  return (
    <div className="w-full h-64 bg-slate-900 rounded-xl p-4 shadow">
      <h3 className="text-lg font-bold text-slate-100 mb-2">Upsets by Week</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: 'none',
              color: '#f1f5f9',
            }}
            labelStyle={{ color: 'white' }}
          />
          <Bar dataKey="count" fill="#991b1b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
