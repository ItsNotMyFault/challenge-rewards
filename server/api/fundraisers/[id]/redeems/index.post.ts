import { eq } from 'drizzle-orm'
import { fundraisers, redeems } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const fundraiserId = Number(getRouterParam(event, 'id'))

  // Check ownership
  const rows = await db.select().from(fundraisers).where(eq(fundraisers.id, fundraiserId))
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Fundraiser not found' })
  }
  const fundraiser = rows[0]!
  if (fundraiser.userId !== user.id && !user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readBody(event)

  const values: Record<string, any> = {
    fundraiserId,
    type: body.type,
    category: body.category,
    redeemer: body.redeemer,
    rewardName: body.rewardName,
    note: body.note || '',
    status: 'active',
  }

  // Type-specific fields
  switch (body.type) {
    case 'timed':
      values.requiredMs = body.requiredMs
      values.accumulatedMs = 0
      values.timerStartedAt = null
      break
    case 'banked':
      values.quantity = body.quantity || 1
      values.totalRedeemed = body.quantity || 1
      values.totalConsumed = 0
      break
    case 'instant':
      values.completedAt = null
      break
    case 'counter':
      values.targetCount = body.targetCount
      values.currentCount = 0
      break
    case 'toggle':
      values.activatedAt = null
      values.deactivatedAt = null
      break
  }

  const inserted = await db.insert(redeems).values(values).returning()
  const r = inserted[0]!

  return {
    id: String(r.id),
    fundraiserId: String(r.fundraiserId),
    type: r.type,
    category: r.category,
    redeemer: r.redeemer,
    rewardName: r.rewardName,
    note: r.note,
    status: r.status,
    requiredMs: r.requiredMs,
    accumulatedMs: r.accumulatedMs,
    timerStartedAt: r.timerStartedAt?.toISOString() ?? null,
    quantity: r.quantity,
    totalRedeemed: r.totalRedeemed,
    totalConsumed: r.totalConsumed,
    completedAt: r.completedAt?.toISOString() ?? null,
    targetCount: r.targetCount,
    currentCount: r.currentCount,
    activatedAt: r.activatedAt?.toISOString() ?? null,
    deactivatedAt: r.deactivatedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
})
