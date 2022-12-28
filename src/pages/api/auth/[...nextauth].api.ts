import { NextApiRequest, NextApiResponse, NextPageContext } from 'next'
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google'
import { GOOGLE_SCOPE } from '../../../constants/google-scope'
import { PrismaAdapter } from '../../../lib/auth/prisma-adapter'

const googleScope = [
  GOOGLE_SCOPE.USERINFO.PROFILE,
  GOOGLE_SCOPE.USERINFO.EMAIL,
  GOOGLE_SCOPE.CALENDAR.ALL,
]

export function buildNextAuthOptions(
  req: NextApiRequest | NextPageContext['req'],
  res: NextApiResponse | NextPageContext['res'],
): NextAuthOptions {
  return {
    adapter: PrismaAdapter(req, res),
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
          params: {
            scope: googleScope.join(' '),
          },
        },
        profile(profile: GoogleProfile) {
          return {
            id: profile.sub,
            avatar_url: profile.picture,
            email: profile.email,
            name: profile.name,
            username: '',
          }
        },
      }),
    ],
    callbacks: {
      async signIn({ account }) {
        if (!account?.scope?.includes(GOOGLE_SCOPE.CALENDAR.ALL)) {
          return '/register/connect-calendar?error=permissions'
        }
        return true
      },
      async session({ session, user }) {
        return {
          ...session,
          user,
        }
      },
    },
  }
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, buildNextAuthOptions(req, res))
}
