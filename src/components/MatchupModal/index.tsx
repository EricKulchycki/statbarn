import React from 'react'
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react'
import { formatDate } from '@/utils/time'
import { getPredictedWinnerFromPrediction } from '@/utils/prediction'
import { getTeamLogo, getTeamFullName } from '@/utils/team'
import { Prediction } from '@/models/prediction'
import { NHLGame } from '@/types/game'
import { Team } from '@/types/team'
import Image from 'next/image'

interface MatchupModalProps {
  open: boolean
  onClose: () => void
  prediction: Prediction | null
  game: NHLGame | null
  matchupHistory?: Array<{
    date: string
    homeTeam: string
    awayTeam: string
    homeScore: number
    awayScore: number
    winner: string
  }>
  teams?: Team[]
}

export function MatchupModal({
  open,
  onClose,
  prediction,
  game,
  matchupHistory = [],
  teams = [],
}: MatchupModalProps) {
  if (!open || !prediction || !game) return null

  const predictedWinner = getPredictedWinnerFromPrediction(prediction)
  const last5Matchups = matchupHistory.slice(-5).reverse()

  return (
    <Modal isOpen={open} onClose={onClose} size="5xl">
      <ModalContent>
        {() => (
          <>
            <ModalHeader />
            <ModalBody>
              <div className="flex flex-row gap-6">
                {/* Away Team Column */}
                <div className="flex-1 flex flex-col items-center justify-center">
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
                  <div className="text-sm text-gray-400 mb-2">Away Team</div>
                  <div className="text-sm text-gray-300">
                    <strong>Prediction:</strong>{' '}
                    {predictedWinner === game.awayTeam.abbrev ? 'Win' : 'Loss'}
                  </div>
                </div>
                {/* Middle Column: Last 5 Matchup Winners */}
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="text-md font-semibold text-slate-200 mb-2">
                    Last 5 Matchup Winners
                  </div>
                  {last5Matchups.length === 0 ? (
                    <div className="text-sm text-gray-400">
                      No recent matchups found.
                    </div>
                  ) : (
                    last5Matchups.map((m, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <Image
                          src={getTeamLogo(teams, m.winner) ?? ''}
                          alt={m.winner}
                          className="w-10 h-10 rounded-full bg-slate-700 mb-1"
                          height={64}
                          width={64}
                        />
                        <span className="text-xs text-slate-100">
                          {m.winner}
                        </span>
                        <span className="text-xs text-gray-400">{m.date}</span>
                      </div>
                    ))
                  )}
                </div>
                {/* Home Team Column */}
                <div className="flex-1 flex flex-col items-center justify-center">
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
                  <div className="text-sm text-gray-400 mb-2">Home Team</div>
                  <div className="text-sm text-gray-300">
                    <strong>Prediction:</strong>{' '}
                    {predictedWinner === game.homeTeam.abbrev ? 'Win' : 'Loss'}
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center text-sm text-gray-400">
                <strong>Game Date:</strong> {formatDate(prediction.gameDate)}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
