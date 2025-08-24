export const formatDate = (dateStr: string) => {
  const readable = new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return readable
}
