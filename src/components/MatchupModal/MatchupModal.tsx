import { MatchupData } from '@/actions/matchup'
import { NHLGame } from '@/types/game'
import { GamePrediction } from '@/types/gamePrediction'
import { Team } from '@/types/team'
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react'
import { ReactNode } from 'react'
import { MatchupHero } from './MatchupHero'
import {
  buildHero,
  buildMeetings,
  findTeamStats,
  formatKickoff,
} from './presentation'
import { RecentMeetings } from './RecentMeetings'
import { SeasonComparison } from './SeasonComparison'

interface MatchupModalProps {
  open: boolean
  onClose: () => void
  prediction: GamePrediction | null
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

  const hero = buildHero(game, prediction, teams)

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{ base: 'border border-slate-800 bg-slate-900' }}
    >
      <ModalContent>
        <ModalHeader className="flex items-baseline gap-4 border-b border-slate-800 px-6 py-5 sm:px-8">
          <span className="text-lg font-extrabold uppercase tracking-wider text-slate-100">
            Matchup
          </span>
          <span className="text-sm font-normal text-slate-400">
            {formatKickoff(game.startTimeUTC, game.homeTeam.placeName.default)}
          </span>
        </ModalHeader>

        <ModalBody className="gap-0 p-0">
          <MatchupHero hero={hero} />

          <div className="grid border-t border-slate-800 md:grid-cols-2 md:divide-x md:divide-slate-800">
            <DetailPanel isLoading={isLoading} hasData={matchupData !== null}>
              {matchupData && (
                <SeasonComparison
                  hero={hero}
                  away={findTeamStats(matchupData, hero.away.abbrev)}
                  home={findTeamStats(matchupData, hero.home.abbrev)}
                />
              )}
            </DetailPanel>
            <DetailPanel isLoading={isLoading} hasData={matchupData !== null}>
              {matchupData && (
                <RecentMeetings
                  meetings={buildMeetings(matchupData.history, hero)}
                />
              )}
            </DetailPanel>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

function DetailPanel({
  isLoading,
  hasData,
  children,
}: {
  isLoading: boolean
  hasData: boolean
  children: ReactNode
}) {
  return (
    <div className="p-6 sm:p-8">
      {isLoading ? (
        <div className="space-y-4" aria-busy>
          <div className="h-5 w-32 animate-pulse rounded bg-slate-800" />
          <div className="h-10 animate-pulse rounded bg-slate-800" />
          <div className="h-10 animate-pulse rounded bg-slate-800" />
          <div className="h-10 animate-pulse rounded bg-slate-800" />
        </div>
      ) : hasData ? (
        children
      ) : (
        <p className="text-sm text-slate-400">
          Couldn&apos;t load matchup history.
        </p>
      )}
    </div>
  )
}
