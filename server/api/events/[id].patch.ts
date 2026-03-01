import { eq } from 'drizzle-orm'
import { events } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const updates: Record<string, any> = { updatedAt: new Date() }
  if (body.name !== undefined) updates.name = body.name
  if (body.description !== undefined) updates.description = body.description
  if (body.goal !== undefined) updates.goal = body.goal
  if (body.donationUrl !== undefined) updates.donationUrl = body.donationUrl
  if (body.status !== undefined) updates.status = body.status

  const updated = await db.update(events).set(updates).where(eq(events.id, id)).returning()
  if (updated.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  const row = updated[0]!
  return {
    ...row,
    id: String(row.id),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
})
