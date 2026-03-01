import { eq, sql } from 'drizzle-orm'
import { events, fundraisers } from '../../database/schema'

export default defineEventHandler(async () => {
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
    })
    .from(events)
    .orderBy(events.createdAt)

  return rows.map(r => ({
    ...r,
    id: String(r.id),
    fundraiserCount: Number(r.fundraiserCount),
    raised: Number(r.raised),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }))
})
