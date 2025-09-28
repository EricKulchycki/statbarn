import { DateTime } from 'luxon'

export function getCurrentNHLSeason(): string {
  const now = DateTime.now()
  const currentYear = now.year
  const currentMonth = now.month

  // NHL seasons typically start in October (month 9) and end in April/June of the following year
  if (currentMonth >= 9) {
    // If it's October (month 9) or later, the season starts in the current year
    return `${currentYear}${currentYear + 1}`
  } else {
    // If it's before October, the season started in the previous year
    return `${currentYear - 1}${currentYear}`
  }
}

export function getYesterdayDate(): Date {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1) // Subtract one day
  return yesterday
}

export function getYesterdayDateReadable(): string {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1) // Subtract one day

  const year = yesterday.getFullYear()
  const month = String(yesterday.getMonth() + 1).padStart(2, '0') // Months are 0-based
  const day = String(yesterday.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getStartOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
