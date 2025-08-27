'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { GameELO } from '@/models/gameElo'
import { getSelf } from '@/utils/gameElo'

interface AllTeamsHistoryGraphProps {
  historyByTeam: { [abbrev: string]: GameELO[] }
}

export const AllTeamsHistoryGraph: React.FC<AllTeamsHistoryGraphProps> = ({
  historyByTeam,
}) => {
  // Build a set of all game dates (for x-axis)
  const allDatesSet = new Set<string>()
  Object.values(historyByTeam).forEach((history) => {
    history.forEach((gameElo) => {
      allDatesSet.add(new Date(gameElo.gameDate).toLocaleDateString())
    })
  })
  const allDates = Array.from(allDatesSet).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  )

  // Build chart data: each entry is { date, [teamAbbrev]: elo, ... }
  const chartData = allDates.map((date) => {
    const entry: { date: string; [abbrev: string]: number | string } = { date }
    for (const [abbrev, history] of Object.entries(historyByTeam)) {
      const game = history.find(
        (g) => new Date(g.gameDate).toLocaleDateString() === date
      )
      if (game) {
        entry[abbrev] = getSelf(game, abbrev).eloAfter
      }
    }
    return entry
  })

  // Pick colors for each team (can be improved with a color palette)
  const teamColors = [
    '#2563eb',
    '#e11d48',
    '#059669',
    '#f59e42',
    '#6366f1',
    '#d97706',
    '#10b981',
    '#f43f5e',
    '#3b82f6',
    '#a21caf',
    '#fbbf24',
    '#0ea5e9',
    '#be185d',
    '#22d3ee',
    '#f87171',
    '#65a30d',
    '#7c3aed',
    '#facc15',
    '#ea580c',
    '#14b8a6',
    '#eab308',
    '#64748b',
    '#f472b6',
    '#1e293b',
    '#fcd34d',
    '#334155',
    '#e879f9',
    '#a3e635',
    '#fca5a5',
    '#6d28d9',
    '#fef08a',
    '#991b1b',
    '#f3f4f6',
  ]

  const teamAbbrevs = Object.keys(historyByTeam)

  if (Object.entries(historyByTeam).length === 0) {
    return null
  }

  return (
    <div className="rounded-xl lg:p-6 h-full col-span-1 lg:col-span-3">
      <h2 className="text-xl font-bold mb-6">All Teams ELO History</h2>
      <div className="h-full bg-slate-900 p-2 rounded-2xl flex items-center">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#1d293d" strokeDasharray="5 5" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {teamAbbrevs.map((abbrev, idx) => (
              <Line
                key={abbrev}
                type="monotone"
                dataKey={abbrev}
                stroke={teamColors[idx % teamColors.length]}
                strokeWidth={2}
                dot={false}
                name={abbrev}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
