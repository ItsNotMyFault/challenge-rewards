import { eq } from 'drizzle-orm'
import { events, fundraisers, redeems } from '../../database/schema'

function serializeRedeem(r: any) {
  return {
    id: String(r.id),
    fundraiserId: String(r.fundraiserId),
    type: r.type,
    category: r.category,
    redeemer: r.redeemer,
    rewardName: r.rewardName,
    note: r.note,
    status: r.status,
    // timed
    requiredMs: r.requiredMs,
    accumulatedMs: r.accumulatedMs,
    timerStartedAt: r.timerStartedAt?.toISOString() ?? null,
    // banked
    quantity: r.quantity,
    totalRedeemed: r.totalRedeemed,
    totalConsumed: r.totalConsumed,
    // instant
    completedAt: r.completedAt?.toISOString() ?? null,
    // counter
    targetCount: r.targetCount,
    currentCount: r.currentCount,
    // toggle
    activatedAt: r.activatedAt?.toISOString() ?? null,
    deactivatedAt: r.deactivatedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const eventRows = await db.select().from(events).where(eq(events.id, id))
  if (eventRows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  const dbEvent = eventRows[0]!
  const dbFundraisers = await db.select().from(fundraisers).where(eq(fundraisers.eventId, id))
  const fundraiserIds = dbFundraisers.map(f => f.id)

  let dbRedeems: any[] = []
  if (fundraiserIds.length > 0) {
    const { inArray } = await import('drizzle-orm')
    dbRedeems = await db.select().from(redeems).where(inArray(redeems.fundraiserId, fundraiserIds))
  }

  const redeemsByFundraiser = new Map<number, any[]>()
  for (const r of dbRedeems) {
    const list = redeemsByFundraiser.get(r.fundraiserId) || []
    list.push(serializeRedeem(r))
    redeemsByFundraiser.set(r.fundraiserId, list)
  }

  return {
    id: String(dbEvent.id),
    name: dbEvent.name,
    description: dbEvent.description,
    goal: dbEvent.goal,
    donationUrl: dbEvent.donationUrl,
    status: dbEvent.status,
    createdAt: dbEvent.createdAt.toISOString(),
    updatedAt: dbEvent.updatedAt.toISOString(),
    fundraisers: dbFundraisers.map(f => ({
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
      redeems: redeemsByFundraiser.get(f.id) || [],
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    })),
  }
})
