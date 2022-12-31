import { NextApiRequest, NextApiResponse } from 'next'
import { HTTP_METHODS, HTTP_STATUS_CODES } from '../../../../constants/http'
import { prisma } from '../../../../lib/prisma'
import { getWeekIndexes } from '../../../../utils/calendar'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== HTTP_METHODS.GET) {
    return res.status(HTTP_STATUS_CODES.METHOD_NOT_ALLOWED).end()
  }

  const username = String(req.query.username)
  const { year, month } = req.query

  if (!year || !month) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ message: 'Year or month not specified.' })
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ message: 'User does not exist.' })
  }

  const availableWeekDays = await prisma.userTimeIntervals.findMany({
    select: {
      week_day: true,
    },
    where: {
      user_id: user.id,
    },
  })

  const weekIndexes = getWeekIndexes()

  const blockedWeekDays = weekIndexes.filter((weekDay) => {
    return !availableWeekDays.some(
      (availableWeekDay) => availableWeekDay.week_day === weekDay,
    )
  })

  const YEAR_MONTH = `${year}-${String(month).padStart(2, '0')}`
  const blockedDatesRaw: Array<{ date: number }> = await prisma.$queryRaw`
     SELECT
      EXTRACT(DAY FROM S.DATE) AS date,
      COUNT(S.date) AS amount,
      ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60) AS size
    FROM schedulings S
    LEFT JOIN user_time_intervals UTI
      ON UTI.week_day = WEEKDAY(DATE_ADD(S.date, INTERVAL 1 DAY))
    WHERE S.user_id = ${user.id}
      AND DATE_FORMAT(S.date, "%Y-%m") = ${YEAR_MONTH}
      GROUP BY EXTRACT(DAY FROM S.DATE),
      ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60)
    HAVING amount >= size
  `

  const blockedDates = blockedDatesRaw.map((item) => item.date)

  return res.json({ blockedWeekDays, blockedDates })
}
