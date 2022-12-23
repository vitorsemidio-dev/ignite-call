import type { NextApiRequest, NextApiResponse } from 'next'
import { setCookie } from 'nookies'
import { HTTP_METHODS, HTTP_STATUS_CODES } from '../../../constants/http'
import { prisma } from '../../../lib/prisma'
import { convertDaysToSeconds } from '../../../utils/convert'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== HTTP_METHODS.POST) {
    return res.status(HTTP_STATUS_CODES.METHOD_NOT_ALLOWED).end()
  }

  const { name, username } = req.body
  const userExists = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (userExists) {
    return res.status(HTTP_STATUS_CODES.CONFLICT).json({
      error: 'User already exists',
    })
  }

  const user = await prisma.user.create({
    data: {
      name,
      username,
    },
  })

  setCookie({ res }, '@ignitecall:userId', user.id, {
    maxAge: convertDaysToSeconds(7),
    path: '/',
  })

  return res.status(HTTP_STATUS_CODES.CREATED).json(user)
}
