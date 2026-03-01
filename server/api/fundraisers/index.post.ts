import { and, eq, sql } from 'drizzle-orm'
import { fundraisers, events } from '../../database/schema'

const AVATAR_COLORS = [
  'blue', 'emerald', 'amber', 'violet', 'rose', 'cyan', 'orange', 'teal',
]

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const eventId = Number(body.eventId)

  // Verify event exists
  const eventRows = await db.select().from(events).where(eq(events.id, eventId))
  if (eventRows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  // Prevent duplicate: one fundraiser per user per event
  const existing = await db.select({ id: fundraisers.id }).from(fundraisers).where(
    and(eq(fundraisers.eventId, eventId), eq(fundraisers.userId, user.id)),
  )
  if (existing.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'You have already joined this event' })
  }

  // Get count for avatar color cycling
  const countResult = await db.select({ count: sql<number>`COUNT(*)` }).from(fundraisers).where(eq(fundraisers.eventId, eventId))
  const colorIndex = Number(countResult[0]?.count ?? 0) % AVATAR_COLORS.length

  const inserted = await db.insert(fundraisers).values({
    eventId,
    userId: user.id,
    name: body.name,
    avatarColor: AVATAR_COLORS[colorIndex]!,
    goal: body.goal,
    twitchUrl: body.twitchUrl || '',
    donationUrl: body.donationUrl || '',
    rewardCatalogIds: body.rewardCatalogIds || [],
  }).returning()

  const f = inserted[0]!
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
    redeems: [],
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }
})
