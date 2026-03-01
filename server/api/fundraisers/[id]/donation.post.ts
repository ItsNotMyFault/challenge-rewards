import { eq, sql } from 'drizzle-orm'
import { fundraisers } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const amount = Number(body.amount)

  if (!amount || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid amount' })
  }

  const updated = await db.update(fundraisers)
    .set({
      raised: sql`${fundraisers.raised} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(fundraisers.id, id))
    .returning()

  if (updated.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Fundraiser not found' })
  }

  return { raised: updated[0]!.raised }
})
