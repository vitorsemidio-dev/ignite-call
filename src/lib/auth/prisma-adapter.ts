import { Session, User } from '@prisma/client'
import { NextApiRequest, NextApiResponse, NextPageContext } from 'next'
import { Adapter } from 'next-auth/adapters'
import { destroyCookie, parseCookies } from 'nookies'
import { prisma } from '../prisma'

function serializeUser(prismaUser: User) {
  return {
    id: prismaUser.id,
    username: prismaUser.username,
    email: prismaUser.email!,
    name: prismaUser.name,
    avatar_url: prismaUser.avatar_url!,
    emailVerified: null,
  }
}

function serializeSession(prismaSession: Session) {
  return {
    sessionToken: prismaSession.session_token,
    userId: prismaSession.user_id,
    expires: prismaSession.expires,
  }
}

export function PrismaAdapter(
  req: NextApiRequest | NextPageContext['req'],
  res: NextApiResponse | NextPageContext['res'],
): Adapter {
  return {
    async createUser(user) {
      const keyCookie = '@ignitecall:userId'
      const { [keyCookie]: userIdOnCookies } = parseCookies({ req })

      if (!userIdOnCookies) {
        throw new Error('User not found on cookies')
      }
      const prismaUser = await prisma.user.update({
        where: {
          id: userIdOnCookies,
        },
        data: {
          email: user.email,
          name: user.name!,
          avatar_url: user.avatar_url,
        },
      })

      destroyCookie({ res }, keyCookie, {
        path: '/',
      })
      return serializeUser(prismaUser)
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({
        where: { id },
      })

      if (!user) {
        return null
      }

      return serializeUser(user)
    },
    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return null
      }

      return serializeUser(user)
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_provider_account_id: {
            provider,
            provider_account_id: providerAccountId,
          },
        },
        include: {
          user: true,
        },
      })

      if (!account) {
        return null
      }

      const { user } = account

      if (!user) {
        return null
      }

      return serializeUser(user)
    },

    async updateUser(user) {
      const prismaUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name!,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      })

      return serializeUser(prismaUser)
    },
    async deleteUser(userId) {
      return null
    },
    async linkAccount(account) {
      await prisma.account.create({
        data: {
          user_id: account.userId,
          type: account.type,
          provider: account.provider,
          provider_account_id: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      })
    },
    async unlinkAccount({ providerAccountId, provider }) {},
    async createSession({ sessionToken, userId, expires }) {
      const prismaSession = await prisma.session.create({
        data: {
          session_token: sessionToken,
          user_id: userId,
          expires,
        },
      })

      return serializeSession(prismaSession)
    },
    async getSessionAndUser(sessionToken) {
      const prismaSession = await prisma.session.findUnique({
        where: { session_token: sessionToken },
        include: {
          user: true,
        },
      })

      if (!prismaSession) {
        return null
      }

      const { user, ...session } = prismaSession

      return {
        user: serializeUser(user),
        session: serializeSession(session),
      }
    },
    async updateSession({ sessionToken, expires, userId }) {
      const prismaSession = await prisma.session.update({
        where: { session_token: sessionToken },
        data: {
          expires,
          user_id: userId,
        },
      })

      return serializeSession(prismaSession)
    },
    async deleteSession(sessionToken) {
      await prisma.session.delete({
        where: { session_token: sessionToken },
      })
    },
    async createVerificationToken({ identifier, expires, token }) {
      return null
    },
    async useVerificationToken({ identifier, token }) {
      return null
    },
  }
}
