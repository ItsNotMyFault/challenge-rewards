import { eq, sql } from 'drizzle-orm'
import { events, fundraisers } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const sessionUser = await getOptionalUser(event)

  const rows = await db
    .select({
      id: events.id,
      name: events.name,
      description: events.description,
      goal: events.goal,
      donationUrl: events.donationUrl,
      status: events.status,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      fundraiserCount: sql<number>`(SELECT COUNT(*) FROM ${fundraisers} WHERE ${fundraisers.eventId} = ${events.id})`.as('fundraiser_count'),
      raised: sql<number>`COALESCE((SELECT SUM(${fundraisers.raised}) FROM ${fundraisers} WHERE ${fundraisers.eventId} = ${events.id}), 0)`.as('raised'),
      ...(sessionUser
        ? {
            myFundraiserId: sql<number | null>`(SELECT ${fundraisers.id} FROM ${fundraisers} WHERE ${fundraisers.eventId} = ${events.id} AND ${fundraisers.userId} = ${sessionUser.id} LIMIT 1)`.as('my_fundraiser_id'),
          }
        : {}),
    })
    .from(events)
    .orderBy(events.createdAt)

  return rows.map(r => ({
    ...r,
    id: String(r.id),
    fundraiserCount: Number(r.fundraiserCount),
    raised: Number(r.raised),
    myFundraiserId: 'myFundraiserId' in r && r.myFundraiserId ? String(r.myFundraiserId) : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }))
})
