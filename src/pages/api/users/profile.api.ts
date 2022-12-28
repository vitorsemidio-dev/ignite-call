import type { NextApiRequest, NextApiResponse } from 'next'
// eslint-disable-next-line camelcase
import { unstable_getServerSession } from 'next-auth'
import { z } from 'zod'
import { HTTP_METHODS, HTTP_STATUS_CODES } from '../../../constants/http'
import { prisma } from '../../../lib/prisma'
import { buildNextAuthOptions } from '../auth/[...nextauth].api'

const updateProfileBodySchema = z.object({
  bio: z.string(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== HTTP_METHODS.PUT) {
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

  const { bio } = updateProfileBodySchema.parse(req.body)
  await prisma.user.update({
    where: {
      id: session.user?.id,
    },
    data: {
      bio,
    },
  })

  return res.status(HTTP_STATUS_CODES.NO_CONTENT).end()
}
