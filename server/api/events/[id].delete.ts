import { eq } from 'drizzle-orm'
import { events } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))

  const deleted = await db.delete(events).where(eq(events.id, id)).returning()
  if (deleted.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  return { success: true }
})
