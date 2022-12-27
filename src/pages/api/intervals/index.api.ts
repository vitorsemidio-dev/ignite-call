import { NextApiRequest, NextApiResponse } from 'next'
// eslint-disable-next-line camelcase
import { unstable_getServerSession } from 'next-auth'
import { z } from 'zod'
import { HTTP_METHODS, HTTP_STATUS_CODES } from '../../../constants/http'
import { prisma } from '../../../lib/prisma'
import { buildNextAuthOptions } from '../auth/[...nextauth].api'

const timeIntervalBodySchema = z.object({
  intervals: z.array(
    z.object({
      weekDay: z.number().min(0).max(6),
      startTimeInMinutes: z
        .number()
        .min(0)
        .max(24 * 60),
      endTimeInMinutes: z
        .number()
        .min(0)
        .max(24 * 60),
    }),
  ),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== HTTP_METHODS.POST) {
    return res.status(HTTP_STATUS_CODES.METHOD_NOT_ALLOWED).end()
  }

  const session = await unstable_getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res),
  )

  if (!session) {
    return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).end()
  }

  const { intervals } = timeIntervalBodySchema.parse(req.body)

  await Promise.all(
    intervals.map((interval) => {
      return prisma.userTimeIntervals.create({
        data: {
          time_end_in_minutes: interval.endTimeInMinutes,
          time_start_in_minutes: interval.startTimeInMinutes,
          week_day: interval.weekDay,
          user_id: session.user?.id,
        },
      })
    }),
  )

  return res.status(HTTP_STATUS_CODES.CREATED).end()
}
