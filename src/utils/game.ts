export function isLive(
  status: 'FUT' | 'LIVE' | 'FINAL' | 'CRIT' | 'OFF'
): boolean {
  return (
    status !== 'FUT' &&
    status !== 'FINAL' &&
    status !== 'OFF' &&
    (status === 'CRIT' || status === 'LIVE')
  )
}
