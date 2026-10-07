import { getMatchupHistory, MatchupData } from '@/actions/matchup'
import { NHLGame } from '@/types/game'
import { GamePrediction } from '@/types/gamePrediction'
import { useDisclosure } from '@heroui/react'
import { useRef, useState } from 'react'

const MATCHUP_HISTORY_LIMIT = 5

interface Selection {
  game: NHLGame
  prediction: GamePrediction
}

export function useMatchupModal(
  gamesById: Map<number, NHLGame>,
  predictionsById: Map<number, GamePrediction>
) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selection, setSelection] = useState<Selection | null>(null)
  const [matchupData, setMatchupData] = useState<MatchupData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  // Ignores responses for a game that is no longer selected
  const latestRequest = useRef(0)

  const openMatchup = async (gameId: number) => {
    const game = gamesById.get(gameId)
    const prediction = predictionsById.get(gameId)
    if (!game || !prediction) return

    const requestId = ++latestRequest.current
    setSelection({ game, prediction })
    setMatchupData(null)
    setIsLoading(true)
    onOpen()

    try {
      const data = await getMatchupHistory(
        game.awayTeam.abbrev,
        game.homeTeam.abbrev,
        MATCHUP_HISTORY_LIMIT
      )
      if (requestId === latestRequest.current) setMatchupData(data)
    } catch (error) {
      console.error('Failed to fetch matchup data:', error)
    } finally {
      if (requestId === latestRequest.current) setIsLoading(false)
    }
  }

  return {
    openMatchup,
    modalProps: {
      open: isOpen,
      onClose,
      game: selection?.game ?? null,
      prediction: selection?.prediction ?? null,
      matchupData,
      isLoading,
    },
  }
}
