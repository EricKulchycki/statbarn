'use client'

import { GameELO } from '@/models/gameElo'
import { getOpponent, getSelf } from '@/utils/gameElo'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import React from 'react'

interface EloHistoryTableProps {
  history: GameELO[]
  teamAbbrev: string
}

export const EloHistoryTable: React.FC<EloHistoryTableProps> = ({
  history,
  teamAbbrev,
}) => {
  return (
    <div className="rounded-xl lg:p-6">
      <h2 className="text-2xl font-bold mb-6">{teamAbbrev} ELO History</h2>
      <div className="overflow-x-auto">
        <Table>
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
              ELO After
            </TableColumn>
          </TableHeader>
          <TableBody>
            {history.map((gameElo) => {
              const isHome = gameElo.homeTeam.abbrev === teamAbbrev
              return (
                <TableRow key={gameElo.gameId}>
                  <TableCell className="py-2 px-4 rounded-l-xl">
                    {new Date(gameElo.gameDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>

                  <TableCell className="py-2 px-4">
                    {getOpponent(gameElo, teamAbbrev).abbrev}
                  </TableCell>
                  <TableCell className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold }`}
                    >
                      {gameElo.homeTeam.abbrev === teamAbbrev ? 'Home' : 'Away'}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-4">
                    {isHome && gameElo.homeTeam.score > gameElo.awayTeam.score
                      ? 'Win'
                      : !isHome &&
                          gameElo.awayTeam.score > gameElo.homeTeam.score
                        ? 'Win'
                        : 'Loss'}
                  </TableCell>
                  <TableCell className="py-2 px-4 rounded-r-xl font-bold">
                    {getSelf(gameElo, teamAbbrev).eloAfter.toFixed(0)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
