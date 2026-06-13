'use client'

import { TeamSeasonGame } from '@/types/team'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import React from 'react'
import { WinLossChip } from './ui/WinLoss'

interface EloHistoryTableProps {
  history: TeamSeasonGame[]
}

export const EloHistoryTable: React.FC<EloHistoryTableProps> = ({
  history,
}) => {
  return (
    <div className="rounded-xl lg:p-6 h-full">
      <h2 className="text-2xl font-bold mb-6">Last 10 Games</h2>
      <div className="overflow-x-auto h-full">
        <Table className="h-full">
          <TableHeader>
            <TableColumn className="py-3 px- font-semibold rounded-tl-xl">
              Date
            </TableColumn>
            <TableColumn className="py-3 px-4 font-semibold">
              Opponent
            </TableColumn>
            <TableColumn className="py-3 px-4 font-semibold">
              Home/Away
            </TableColumn>
            <TableColumn className="py-3 px-4 font-semibold">
              Win/Loss
            </TableColumn>
            <TableColumn className="py-3 px-4 font-semibold rounded-tr-xl">
              Rating After
            </TableColumn>
          </TableHeader>
          <TableBody>
            {history.map((game) => (
              <TableRow key={game.gameId} className="hover:bg-slate-800">
                <TableCell className="py-2 px-4 rounded-l-xl">
                  {new Date(game.gameDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </TableCell>
                <TableCell className="py-2 px-4">{game.opponent}</TableCell>
                <TableCell className="py-2 px-4">
                  <span className="px-2 py-1 rounded text-xs font-semibold">
                    {game.isHome ? 'Home' : 'Away'}
                  </span>
                </TableCell>
                <TableCell className="py-2 px-4">
                  <WinLossChip val={game.outcome?.actualWin ? 'win' : 'loss'} />
                </TableCell>
                <TableCell className="py-2 px-4 rounded-r-xl font-bold">
                  {(game.outcome?.eloAfter ?? game.eloBefore).toFixed(0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
