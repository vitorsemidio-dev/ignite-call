import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { GOOGLE_SCOPE } from '../../../constants/google-scope'

const googleScope = [
  GOOGLE_SCOPE.USERINFO.PROFILE,
  GOOGLE_SCOPE.USERINFO.EMAIL,
  GOOGLE_SCOPE.CALENDAR.ALL,
]

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: googleScope.join(' '),
        },
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
  },
}

export default NextAuth(authOptions)
