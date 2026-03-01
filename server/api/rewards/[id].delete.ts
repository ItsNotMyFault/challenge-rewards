import { eq, or } from 'drizzle-orm'
import { rewards } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const idParam = getRouterParam(event, 'id')!
  const numId = Number(idParam)

  const deleted = await db.delete(rewards).where(
    isNaN(numId) ? eq(rewards.presetId, idParam) : or(eq(rewards.id, numId), eq(rewards.presetId, idParam)),
  ).returning()

  if (deleted.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Reward not found' })
  }

  return { success: true }
})
