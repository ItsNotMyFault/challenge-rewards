import { events } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)

  const inserted = await db.insert(events).values({
    name: body.name,
    description: body.description || '',
    goal: body.goal,
    donationUrl: body.donationUrl || '',
    status: body.status || 'active',
  }).returning()

  const row = inserted[0]!
  return {
    ...row,
    id: String(row.id),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
})
