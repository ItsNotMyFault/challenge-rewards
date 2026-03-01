import { eq } from 'drizzle-orm'
import { fundraisers } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  // Check ownership
  const rows = await db.select().from(fundraisers).where(eq(fundraisers.id, id))
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Fundraiser not found' })
  }

  const fundraiser = rows[0]!
  if (fundraiser.userId !== user.id && !user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const updates: Record<string, any> = { updatedAt: new Date() }
  if (body.name !== undefined) updates.name = body.name
  if (body.goal !== undefined) updates.goal = body.goal
  if (body.raised !== undefined) updates.raised = body.raised
  if (body.twitchUrl !== undefined) updates.twitchUrl = body.twitchUrl
  if (body.donationUrl !== undefined) updates.donationUrl = body.donationUrl
  if (body.rewardCatalogIds !== undefined) updates.rewardCatalogIds = body.rewardCatalogIds

  const updated = await db.update(fundraisers).set(updates).where(eq(fundraisers.id, id)).returning()
  const f = updated[0]!
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
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }
})
