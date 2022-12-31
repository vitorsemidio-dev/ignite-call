import dayjs from 'dayjs'

export function getDaysInMonth(date: dayjs.Dayjs) {
  const daysInMonth = date.daysInMonth()
  const days = Array.from({ length: daysInMonth }).map((_, i) => {
    return date.set('date', i + 1)
  })
  return days
}

export function getLastDaysInMonth(n: number, date: dayjs.Dayjs) {
  const firstDayInMonth = date.set('date', 1)
  const daysInMonth = firstDayInMonth.daysInMonth()
  const lastDaysInMonth = Array.from({ length: n })
    .map((_, i) => {
      return firstDayInMonth.set('date', daysInMonth - i)
    })
    .reverse()
  return lastDaysInMonth
}

export function getFistDaysInMonth(n: number, date: dayjs.Dayjs) {
  const firstDayInMonth = date.set('date', 1)
  const firstDaysInMonth = Array.from({ length: n }).map((_, i) => {
    return firstDayInMonth.set('date', i + 1)
  })
  return firstDaysInMonth
}

export function getWeekIndexes() {
  return [0, 1, 2, 3, 4, 5, 6]
}
