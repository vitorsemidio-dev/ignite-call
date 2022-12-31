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

  return res.json({ blockedWeekDays })
}
