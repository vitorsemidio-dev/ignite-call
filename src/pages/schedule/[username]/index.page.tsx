import { Avatar, Heading, Text } from '@ignite-ui/react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { prisma } from '../../../lib/prisma'
import { convertDaysToSeconds } from '../../../utils/convert'
import { ScheduleForm } from './ScheduleForm'
import { Container, UserHeader } from './styles'

interface UserScheduleProps {
  user: {
    name: string
    username: string
    avatarUrl: string
  }
}

export default function UserSchedule({ user }: UserScheduleProps) {
  return (
    <Container>
      <UserHeader>
        <Avatar src={user.avatarUrl} />
        <Heading>{user.name}</Heading>
        <Text>{user.username}</Text>
      </UserHeader>

      <ScheduleForm />
    </Container>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const username = String(ctx.params?.username)

  const prismaUser = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!prismaUser) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      user: {
        name: prismaUser.name,
        username: prismaUser.username,
        avatarUrl: prismaUser.avatar_url,
      },
    },
    revalidate: convertDaysToSeconds(1),
  }
}
