import { rewards } from '../../database/schema'

export default defineEventHandler(async () => {
  const rows = await db.select().from(rewards).orderBy(rewards.category, rewards.rewardName)

  return rows.map(r => ({
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
  }))
})
