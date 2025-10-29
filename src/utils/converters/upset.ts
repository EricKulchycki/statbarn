import { Upset } from '@/types/upset'
import { DateTime } from 'luxon'

export interface SerializedUpset extends Omit<Upset, 'date'> {
  date: string // ISO string representation of the date
}

export function serializeUpset(upset: Upset): SerializedUpset {
  return {
    ...upset,
    date: upset.date.toISO() ?? '', // Convert Luxon DateTime to ISO string
  }
}

export function deserializeUpset(data: SerializedUpset): Upset {
  return {
    ...data,
    date: DateTime.fromISO(data.date), // Convert ISO string back to Luxon DateTime
  }
}
