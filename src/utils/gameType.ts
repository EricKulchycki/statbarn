import { GameType } from '@/constants'

// Helper to map NHL API gameType to your internal type
export function mapNhlGameType(type: number): GameType {
  switch (type) {
    case 1:
      return GameType.PRESEASON
    case 2:
      return GameType.REGULAR
    case 3:
      return GameType.POSTSEASON
    default:
      return GameType.UNKNOWN
  }
}
