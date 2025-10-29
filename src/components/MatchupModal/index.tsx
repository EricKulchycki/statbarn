import React from 'react'
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react'
import { formatDate } from '@/utils/time'
import { getPredictedWinnerFromPrediction } from '@/utils/prediction'
import { Prediction } from '@/models/prediction'
import { NHLGame } from '@/types/game'

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
}

export const MatchupModal: React.FC<MatchupModalProps> = ({
  open,
  onClose,
  prediction,
  game,
  matchupHistory = [],
}) => {
  if (!open || !prediction || !game) return null

  const predictedWinner = getPredictedWinnerFromPrediction(prediction)

  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader>
              {game.awayTeam.abbrev} @ {game.homeTeam.abbrev}
            </ModalHeader>
            <ModalBody>
              <div className="bg-slate-900 rounded-xl p-6 shadow-xl max-w-md w-full z-10 relative">
                <div className="mb-4">
                  <div className="text-sm text-gray-300">
                    <strong>Prediction:</strong> {predictedWinner}
                  </div>
                  <div className="text-sm text-gray-300">
                    <strong>Game Date:</strong>{' '}
                    {formatDate(prediction.gameDate)}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-md font-semibold text-slate-200 mb-2">
                    Matchup History
                  </div>
                  {matchupHistory.length === 0 ? (
                    <div className="text-sm text-gray-400">
                      No recent matchups found.
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {matchupHistory.map((m, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-gray-200 flex gap-2"
                        >
                          <span className="text-gray-400">{m.date}</span>
                          <span>
                            {m.awayTeam} {m.awayScore} @ {m.homeTeam}{' '}
                            {m.homeScore}
                          </span>
                          <span className="text-green-400">
                            Winner: {m.winner}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 w-full"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
