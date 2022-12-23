export function convertDaysToSeconds(days: number) {
  if (days < 0) {
    throw new Error('Days must be greater than 0')
  }
  return days * 24 * 60 * 60
}
