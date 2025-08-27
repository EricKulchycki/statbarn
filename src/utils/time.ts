export const formatDate = (date: Date) => {
  const readable = date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return readable
}

/* convert date of dd/mm/yyyy to JSDate */
export function convertShortToDate(dateString: string): Date {
  const parts = dateString.split('/')
  // Month is 0-indexed, so we subtract 1.
  const date = new Date(
    parseInt(parts[2]),
    parseInt(parts[1]) - 1,
    parseInt(parts[0])
  )
  return date
}
