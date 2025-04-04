export function getCurrentNHLSeason(): string {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0 = January, 11 = December

  // NHL seasons typically start in October (month 9) and end in April/June of the following year
  if (currentMonth >= 9) {
    // If it's October (month 9) or later, the season starts in the current year
    return `${currentYear}${currentYear + 1}`
  } else {
    // If it's before October, the season started in the previous year
    return `${currentYear - 1}${currentYear}`
  }
}
