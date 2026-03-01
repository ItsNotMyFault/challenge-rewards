import { eq } from 'drizzle-orm'
import { fundraisers, redeems } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const rows = await db.select().from(fundraisers).where(eq(fundraisers.id, id))
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Fundraiser not found' })
  }

  const f = rows[0]!
  const dbRedeems = await db.select().from(redeems).where(eq(redeems.fundraiserId, id))

  return {
    id: String(f.id),
    eventId: String(f.eventId),
    userId: f.userId,
    name: f.name,
    avatarColor: f.avatarColor,
    goal: f.goal,
    raised: f.raised,
    twitchUrl: f.twitchUrl,
    donationUrl: f.donationUrl,
    rewardCatalogIds: f.rewardCatalogIds as string[],
    redeems: dbRedeems.map(r => ({
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
    })),
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }
})
