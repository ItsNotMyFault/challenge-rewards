import { eq } from 'drizzle-orm'
import { fundraisers } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))

  const rows = await db.select().from(fundraisers).where(eq(fundraisers.id, id))
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Fundraiser not found' })
  }

  const fundraiser = rows[0]!
  if (fundraiser.userId !== user.id && !user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  await db.delete(fundraisers).where(eq(fundraisers.id, id))
  return { success: true }
})
