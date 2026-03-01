import { rewards } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)

  const inserted = await db.insert(rewards).values({
    rewardName: body.rewardName,
    type: body.type,
    description: body.description || '',
    icon: body.icon || '',
    category: body.category,
    requiredMs: body.requiredMs,
    quantity: body.quantity,
    targetCount: body.targetCount,
  }).returning()

  const r = inserted[0]!
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
