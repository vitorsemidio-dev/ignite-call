import { firstLetterUpper } from './string'

interface GetWeekDaysParams {
  short?: boolean
}

export function getWeekDays({ short }: GetWeekDaysParams = {}) {
  const formatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })

  return Array.from(Array(7).keys())
    .map((day) => {
      const date = new Date(Date.UTC(2021, 5, day))
      return formatter.format(date)
    })
    .map((weekDay) => firstLetterUpper(weekDay))
    .map((weekDay) => (short ? weekDay.slice(0, 3).toUpperCase() : weekDay))
}
