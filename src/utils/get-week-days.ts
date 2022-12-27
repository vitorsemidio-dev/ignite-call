import { firstLetterUpper } from './string'

export function getWeekDays() {
  const formatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })

  return Array.from(Array(7).keys())
    .map((day) => {
      const date = new Date(Date.UTC(2021, 5, day))
      return formatter.format(date)
    })
    .map((weekDay) => firstLetterUpper(weekDay))
}
