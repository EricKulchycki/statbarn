'use client'

import React, { useState } from 'react'
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
import { GameELO, GameELOSerialized } from '@/models/gameElo'
import { getSelf } from '@/utils/gameElo'
import { deserializeGameELOByTeam } from '@/utils/converters/gameElo'
import { Division, Team } from '@/types/team'
import { Button } from '@heroui/react'
import Image from 'next/image'

interface AllTeamsHistoryGraphProps {
  teams: Team[]
  historyByTeamSerialized: { [abbrev: string]: GameELOSerialized[] }
}

export const AllTeamsHistoryGraph: React.FC<AllTeamsHistoryGraphProps> = ({
  teams,
  historyByTeamSerialized,
}) => {
  const [selectedDivision, setSelectedDivision] = useState<Division>(
    Division.CENTRAL
  )
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null)

  const historyByTeam: { [abbrev: string]: GameELO[] } =
    deserializeGameELOByTeam(historyByTeamSerialized)

  delete historyByTeam['ARI'] // Remove Arizona Coyotes if present

  // Filter teams by selected division
  const filteredTeams = teams.filter(
    (team) => team.division === selectedDivision
  )
  const teamAbbrevs = Array.from(
    new Set(filteredTeams.map((team) => team.triCode))
  )

  // Build a set of all game dates (for x-axis)
  const allDatesSet = new Set<string>()
  teamAbbrevs.forEach((abbrev) => {
    ;(historyByTeam[abbrev] || []).forEach((gameElo) => {
      allDatesSet.add(new Date(gameElo.gameDate).toLocaleDateString())
    })
  })
  const allDates = Array.from(allDatesSet).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  )

  // Build chart data: each entry is { date, [teamAbbrev]: elo, ... }
  const lastEloByTeam: { [abbrev: string]: number | undefined } = {}
  const chartData = allDates.map((date) => {
    const entry: { date: string; [abbrev: string]: number | string } = { date }
    for (const abbrev of teamAbbrevs) {
      const history = historyByTeam[abbrev] || []
      const game = history.find(
        (g) => new Date(g.gameDate).toLocaleDateString() === date
      )
      if (game) {
        const elo = getSelf(game, abbrev).eloAfter
        entry[abbrev] = elo
        lastEloByTeam[abbrev] = elo
      } else if (lastEloByTeam[abbrev] !== undefined) {
        entry[abbrev] = lastEloByTeam[abbrev]
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

  // Legend item renderer with hover
  const renderLegend = (props: unknown) => {
    const { payload } = props as { payload: { value: string; color: string }[] }
    return (
      <ul className="flex flex-wrap gap-2">
        {payload.map((entry) => (
          <li
            key={entry.value}
            onMouseEnter={() => setHoveredTeam(entry.value)}
            onMouseLeave={() => setHoveredTeam(null)}
            style={{
              color: entry.color,
              cursor: 'pointer',
              padding: '0 8px',
              opacity: 1,
              fontWeight: 'normal',
              display: 'flex',
            }}
          >
            <Image
              width={24}
              height={24}
              src={
                teams.find((team) => team.triCode === entry.value)?.logo ?? ''
              }
              className="mr-1"
              alt={entry.value}
            />
            {entry.value}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="rounded-xl lg:p-6">
      <h2 className="text-2xl font-bold mb-6">
        {selectedDivision.charAt(0).toUpperCase() + selectedDivision.slice(1)}
        Division ELO History
      </h2>
      <div className="mb-4 flex gap-2">
        {Object.values(Division).map((division) => (
          <Button
            key={division}
            onPress={() => setSelectedDivision(division)}
            variant={selectedDivision === division ? 'solid' : 'faded'}
          >
            {division.charAt(0).toUpperCase() + division.slice(1)}
          </Button>
        ))}
      </div>
      <div className="h-full w-full bg-slate-900 p-2 rounded-2xl flex items-center">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#1d293d" strokeDasharray="5 5" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend content={renderLegend} />
            {teamAbbrevs.map((abbrev, idx) => (
              <Line
                key={abbrev}
                type="monotone"
                dataKey={abbrev}
                stroke={teamColors[idx % teamColors.length]}
                strokeWidth={
                  hoveredTeam === null ? 2 : hoveredTeam === abbrev ? 4 : 1
                }
                dot={false}
                name={abbrev}
                opacity={
                  hoveredTeam === null ? 1 : hoveredTeam === abbrev ? 1 : 0.2
                }
                style={{
                  transition: 'opacity 0.2s, stroke-width 0.2s',
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
