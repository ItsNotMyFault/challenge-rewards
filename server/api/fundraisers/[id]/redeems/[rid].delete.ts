import { eq, and } from 'drizzle-orm'
import { fundraisers, redeems } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const fundraiserId = Number(getRouterParam(event, 'id'))
  const redeemId = Number(getRouterParam(event, 'rid'))

  // Check ownership
  const fRows = await db.select().from(fundraisers).where(eq(fundraisers.id, fundraiserId))
  if (fRows.length === 0) throw createError({ statusCode: 404, statusMessage: 'Fundraiser not found' })
  if (fRows[0]!.userId !== user.id && !user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const deleted = await db.delete(redeems)
    .where(and(eq(redeems.id, redeemId), eq(redeems.fundraiserId, fundraiserId)))
    .returning()

  if (deleted.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Redeem not found' })
  }

  return { success: true }
})
