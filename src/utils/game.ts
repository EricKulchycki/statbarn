export type GameStatus = 'FUT' | 'LIVE' | 'FINAL' | 'CRIT' | 'OFF'

export function isLive(status: GameStatus): boolean {
  return (
    status !== 'FUT' &&
    status !== 'FINAL' &&
    status !== 'OFF' &&
    (status === 'CRIT' || status === 'LIVE')
  )
}
