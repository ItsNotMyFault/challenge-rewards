import { eq, or } from 'drizzle-orm'
import { rewards } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const idParam = getRouterParam(event, 'id')!
  const body = await readBody(event)

  // Find by numeric ID or presetId
  const numId = Number(idParam)
  const rows = await db.select().from(rewards).where(
    isNaN(numId) ? eq(rewards.presetId, idParam) : or(eq(rewards.id, numId), eq(rewards.presetId, idParam)),
  )

  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Reward not found' })
  }

  const updates: Record<string, any> = { updatedAt: new Date() }
  if (body.rewardName !== undefined) updates.rewardName = body.rewardName
  if (body.type !== undefined) updates.type = body.type
  if (body.description !== undefined) updates.description = body.description
  if (body.icon !== undefined) updates.icon = body.icon
  if (body.category !== undefined) updates.category = body.category
  if (body.requiredMs !== undefined) updates.requiredMs = body.requiredMs
  if (body.quantity !== undefined) updates.quantity = body.quantity
  if (body.targetCount !== undefined) updates.targetCount = body.targetCount

  const updated = await db.update(rewards).set(updates).where(eq(rewards.id, rows[0]!.id)).returning()
  const r = updated[0]!
  return {
    id: r.presetId || String(r.id),
    rewardName: r.rewardName,
    type: r.type,
    description: r.description,
    icon: r.icon,
    category: r.category,
    requiredMs: r.requiredMs,
    quantity: r.quantity,
    targetCount: r.targetCount,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
})
