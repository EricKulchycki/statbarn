import React from 'react'
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react'
import { formatDate } from '@/utils/time'
import { getPredictedWinnerFromPrediction } from '@/utils/prediction'
import { getTeamLogo, getTeamFullName } from '@/utils/team'
import { Prediction } from '@/models/prediction'
import { NHLGame } from '@/types/game'
import { Team } from '@/types/team'
import Image from 'next/image'
import { MatchupData } from '@/actions/matchup'

interface MatchupModalProps {
  open: boolean
  onClose: () => void
  prediction: Prediction | null
  game: NHLGame | null
  matchupData?: MatchupData | null
  teams?: Team[]
  isLoading?: boolean
}

export function MatchupModal({
  open,
  onClose,
  prediction,
  game,
  matchupData = null,
  teams = [],
  isLoading = false,
}: MatchupModalProps) {
  if (!open || !prediction || !game) return null

  const predictedWinner = getPredictedWinnerFromPrediction(prediction)
  const matchupHistory = matchupData?.history || []
  const last5Matchups = matchupHistory.slice(0, 5)

  const awayTeamStats =
    matchupData?.teamASeasonStats.teamAbbrev === game.awayTeam.abbrev
      ? matchupData?.teamASeasonStats
      : matchupData?.teamBSeasonStats

  const homeTeamStats =
    matchupData?.teamASeasonStats.teamAbbrev === game.homeTeam.abbrev
      ? matchupData?.teamASeasonStats
      : matchupData?.teamBSeasonStats

  return (
    <Modal isOpen={open} onClose={onClose} size="5xl">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="text-center">
              <div className="w-full text-center text-xl font-bold text-slate-100">
                Matchup Analysis
              </div>
            </ModalHeader>
            <ModalBody className="pb-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-400">Loading matchup data...</div>
                </div>
              ) : (
                <>
                  <div className="flex flex-row gap-6">
                    {/* Away Team Column */}
                    <div className="flex-1 flex flex-col items-center justify-start">
                      <Image
                        src={getTeamLogo(teams, game.awayTeam.abbrev) ?? ''}
                        alt={game.awayTeam.abbrev}
                        className="w-16 h-16 mb-2 rounded-full bg-slate-700"
                        height={64}
                        width={64}
                      />
                      <div className="text-lg font-bold text-slate-100 mb-1">
                        {getTeamFullName(teams, game.awayTeam.abbrev)}
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        Away Team
                      </div>
                      <div className="text-sm text-gray-300 mb-4">
                        <strong>Prediction:</strong>{' '}
                        {predictedWinner === game.awayTeam.abbrev
                          ? 'Win'
                          : 'Loss'}
                      </div>

                      {awayTeamStats && (
                        <div className="bg-slate-800 rounded-lg p-3 w-full">
                          <div className="text-sm font-semibold text-slate-200 mb-2">
                            Season Stats
                          </div>
                          <div className="text-xs text-gray-300 space-y-1">
                            <div className="flex justify-between">
                              <span>Avg Goals Scored:</span>
                              <span className="font-bold">
                                {awayTeamStats.avgPointsScored.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Avg Goals Allowed:</span>
                              <span className="font-bold">
                                {awayTeamStats.avgPointsAllowed.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Games Played:</span>
                              <span className="font-bold">
                                {awayTeamStats.totalGames}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Middle Column: Last 5 Matchup Winners */}
                    <div className="flex flex-col items-center justify-start gap-3 min-w-[200px]">
                      <div className="text-md font-semibold text-slate-200 mb-2">
                        Last 5 Matchups
                      </div>
                      {last5Matchups.length === 0 ? (
                        <div className="text-sm text-gray-400">
                          No recent matchups found.
                        </div>
                      ) : (
                        <>
                          {matchupData?.last5Record && (
                            <div className="bg-slate-800 rounded-lg p-3 mb-2 w-full">
                              <div className="text-xs text-gray-300 space-y-1">
                                <div className="flex justify-between">
                                  <span>{game.awayTeam.abbrev} Wins:</span>
                                  <span className="font-bold text-green-400">
                                    {matchupData.last5Record.teamA ===
                                    last5Matchups.filter(
                                      (m) => m.winner === game.awayTeam.abbrev
                                    ).length
                                      ? matchupData.last5Record.teamA
                                      : matchupData.last5Record.teamB}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>{game.homeTeam.abbrev} Wins:</span>
                                  <span className="font-bold text-green-400">
                                    {matchupData.last5Record.teamA ===
                                    last5Matchups.filter(
                                      (m) => m.winner === game.homeTeam.abbrev
                                    ).length
                                      ? matchupData.last5Record.teamA
                                      : matchupData.last5Record.teamB}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          {last5Matchups.map((m, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 bg-slate-800 rounded-lg p-2 w-full"
                            >
                              <Image
                                src={getTeamLogo(teams, m.winner) ?? ''}
                                alt={m.winner}
                                className="w-10 h-10 rounded-full bg-slate-700"
                                height={40}
                                width={40}
                              />
                              <div className="flex-1">
                                <div className="text-xs font-bold text-slate-100">
                                  {m.winner} Won
                                </div>
                                <div className="text-xs text-gray-400">
                                  {m.awayTeam} {m.awayScore} @ {m.homeTeam}{' '}
                                  {m.homeScore}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {m.date}
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    {/* Home Team Column */}
                    <div className="flex-1 flex flex-col items-center justify-start">
                      <Image
                        src={getTeamLogo(teams, game.homeTeam.abbrev) ?? ''}
                        alt={game.homeTeam.abbrev}
                        className="w-16 h-16 mb-2 rounded-full bg-slate-700"
                        height={64}
                        width={64}
                      />
                      <div className="text-lg font-bold text-slate-100 mb-1">
                        {getTeamFullName(teams, game.homeTeam.abbrev)}
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        Home Team
                      </div>
                      <div className="text-sm text-gray-300 mb-4">
                        <strong>Prediction:</strong>{' '}
                        {predictedWinner === game.homeTeam.abbrev
                          ? 'Win'
                          : 'Loss'}
                      </div>

                      {homeTeamStats && (
                        <div className="bg-slate-800 rounded-lg p-3 w-full">
                          <div className="text-sm font-semibold text-slate-200 mb-2">
                            Season Stats
                          </div>
                          <div className="text-xs text-gray-300 space-y-1">
                            <div className="flex justify-between">
                              <span>Avg Goals Scored:</span>
                              <span className="font-bold">
                                {homeTeamStats.avgPointsScored.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Avg Goals Allowed:</span>
                              <span className="font-bold">
                                {homeTeamStats.avgPointsAllowed.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Games Played:</span>
                              <span className="font-bold">
                                {homeTeamStats.totalGames}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 text-center text-sm text-gray-400">
                    <strong>Game Date:</strong>{' '}
                    {formatDate(prediction.gameDate)}
                  </div>
                </>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
