import { unstable_cache } from 'next/cache'
import { getTeams as getTeamsRaw } from './teams'
import { Team } from '@/types/team'

export const getTeams = unstable_cache(
  async (): Promise<Team[]> => getTeamsRaw(),
  ['teams'],
  { revalidate: 86400, tags: ['teams'] }
)
