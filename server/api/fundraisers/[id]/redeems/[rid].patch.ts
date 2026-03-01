import { eq } from 'drizzle-orm'
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

  const rRows = await db.select().from(redeems).where(eq(redeems.id, redeemId))
  if (rRows.length === 0 || rRows[0]!.fundraiserId !== fundraiserId) {
    throw createError({ statusCode: 404, statusMessage: 'Redeem not found' })
  }

  const redeem = rRows[0]!
  const body = await readBody(event)
  const action = body.action as string
  const now = new Date()
  const updates: Record<string, any> = { updatedAt: now }

  switch (action) {
    case 'startTimer':
      updates.timerStartedAt = now
      updates.status = 'active'
      break
    case 'pauseTimer': {
      if (redeem.timerStartedAt) {
        const elapsed = now.getTime() - new Date(redeem.timerStartedAt).getTime()
        updates.accumulatedMs = (redeem.accumulatedMs || 0) + elapsed
      }
      updates.timerStartedAt = null
      updates.status = 'paused'
      break
    }
    case 'completeTimer':
      if (redeem.timerStartedAt) {
        const elapsed = now.getTime() - new Date(redeem.timerStartedAt).getTime()
        updates.accumulatedMs = (redeem.accumulatedMs || 0) + elapsed
      }
      updates.timerStartedAt = null
      updates.status = 'completed'
      break
    case 'consumeBanked':
      if ((redeem.quantity || 0) > 0) {
        updates.quantity = (redeem.quantity || 0) - 1
        updates.totalConsumed = (redeem.totalConsumed || 0) + 1
        if (updates.quantity <= 0) updates.status = 'completed'
      }
      break
    case 'addToBanked':
      updates.quantity = (redeem.quantity || 0) + (body.amount || 1)
      updates.totalRedeemed = (redeem.totalRedeemed || 0) + (body.amount || 1)
      if (redeem.status === 'completed') updates.status = 'active'
      break
    case 'completeInstant':
      updates.status = 'completed'
      updates.completedAt = now
      break
    case 'incrementCounter':
      updates.currentCount = (redeem.currentCount || 0) + 1
      if (updates.currentCount >= (redeem.targetCount || 0)) updates.status = 'completed'
      break
    case 'decrementCounter':
      updates.currentCount = Math.max(0, (redeem.currentCount || 0) - 1)
      if (redeem.status === 'completed') updates.status = 'active'
      break
    case 'activateToggle':
      updates.activatedAt = now
      updates.deactivatedAt = null
      break
    case 'deactivateToggle':
      updates.deactivatedAt = now
      updates.status = 'completed'
      break
    case 'resetRedeem':
      // Reset type-specific fields
      switch (redeem.type) {
        case 'timed':
          updates.accumulatedMs = 0
          updates.timerStartedAt = null
          break
        case 'banked':
          updates.quantity = redeem.totalRedeemed
          updates.totalConsumed = 0
          break
        case 'counter':
          updates.currentCount = 0
          break
        case 'toggle':
          updates.activatedAt = null
          updates.deactivatedAt = null
          break
        case 'instant':
          updates.completedAt = null
          break
      }
      updates.status = 'active'
      break
    case 'updateNote':
      updates.note = body.note ?? ''
      break
    default:
      throw createError({ statusCode: 400, statusMessage: `Unknown action: ${action}` })
  }

  const updated = await db.update(redeems).set(updates).where(eq(redeems.id, redeemId)).returning()
  const r = updated[0]!

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
