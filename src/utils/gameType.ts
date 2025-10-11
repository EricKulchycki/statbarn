// Helper to map NHL API gameType to your internal type
export function mapNhlGameType(
  type: number
): 'preseason' | 'regular' | 'postseason' | 'unknown' {
  switch (type) {
    case 1:
      return 'preseason'
    case 2:
      return 'regular'
    case 3:
      return 'postseason'
    default:
      return 'unknown'
  }
}
