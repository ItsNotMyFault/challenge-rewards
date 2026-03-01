import { redeems } from '../../database/schema'

export default defineEventHandler(async () => {
  const rows = await db.select().from(redeems).orderBy(redeems.createdAt)

  return rows.map(r => ({
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
  }))
})
