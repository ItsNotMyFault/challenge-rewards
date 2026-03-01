import type { H3Event } from 'h3'
import type { User } from '#auth-utils'

export async function requireAuth(event: H3Event): Promise<User> {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session.user
}

export async function requireAdmin(event: H3Event): Promise<User> {
  const user = await requireAuth(event)
  if (!user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return user
}

export async function getOptionalUser(event: H3Event): Promise<User | null> {
  const session = await getUserSession(event)
  return session.user || null
}
