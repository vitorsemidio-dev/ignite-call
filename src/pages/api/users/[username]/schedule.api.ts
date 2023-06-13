import dayjs from 'dayjs'
import { google } from 'googleapis'
import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { HTTP_METHODS, HTTP_STATUS_CODES } from '../../../../constants/http'
import { getGoogleOAuthToken } from '../../../../lib/google'
import { prisma } from '../../../../lib/prisma'

const createSchedulingBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  observations: z.string(),
  date: z.string().datetime(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== HTTP_METHODS.POST) {
    return res.status(HTTP_STATUS_CODES.METHOD_NOT_ALLOWED).end()
  }

  const username = String(req.query.username)

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

  const { name, email, observations, date } = createSchedulingBodySchema.parse(
    req.body,
  )

  const schedulingDate = dayjs(date).startOf('hour')

  if (schedulingDate.isBefore(new Date())) {
    return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
      message: 'Date is in the past.',
    })
  }

  const conflictingScheduling = await prisma.scheduling.findFirst({
    where: {
      user_id: user.id,
      date: schedulingDate.toDate(),
    },
  })

  if (conflictingScheduling) {
    return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
      message: 'There is another scheduling at at the same time.',
    })
  }

  const scheduling = await prisma.scheduling.create({
    data: {
      name,
      email,
      observations,
      date: schedulingDate.toDate(),
      user_id: user.id,
    },
  })

  const calendar = google.calendar({
    version: 'v3',
    auth: await getGoogleOAuthToken(user.id),
  })

  await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Ignite Call: ${name}`,
      description: observations,
      start: {
        dateTime: schedulingDate.format(),
      },
      end: {
        dateTime: schedulingDate.add(1, 'hour').format(),
      },
      attendees: [{ email, displayName: name }],
      conferenceData: {
        createRequest: {
          requestId: scheduling.id,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    },
  })

  return res.status(HTTP_STATUS_CODES.CREATED).end()
}
