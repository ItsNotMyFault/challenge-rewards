import { eq, sql } from 'drizzle-orm'
import { events, fundraisers, redeems, rewards } from '../database/schema'
import presetData from '../../app/data/redeem-presets.json'

export default defineEventHandler(async (event) => {
  // Seed reward presets (skip if already seeded)
  const existingRewards = await db.select({ count: sql<number>`COUNT(*)` }).from(rewards)
  if (Number(existingRewards[0]?.count) === 0) {
    for (const preset of presetData.presets) {
      await db.insert(rewards).values({
        presetId: preset.id,
        rewardName: preset.rewardName,
        type: preset.type,
        description: preset.description,
        icon: preset.icon,
        category: preset.category,
        requiredMs: (preset as any).requiredMs ?? null,
        quantity: (preset as any).quantity ?? null,
        targetCount: (preset as any).targetCount ?? null,
      }).onConflictDoNothing()
    }
  }

  // Seed demo event (skip if events exist)
  const existingEvents = await db.select({ count: sql<number>`COUNT(*)` }).from(events)
  if (Number(existingEvents[0]?.count) > 0) {
    return { message: 'Database already seeded' }
  }

  // Create 4K4 2026 event
  const [dbEvent] = await db.insert(events).values({
    name: '4K4 2026',
    description: 'Annual 4K4 charity cycling event. Ride hard, raise funds, unlock rewards!',
    goal: 10000,
    donationUrl: 'https://kilometers4kiddos.org/',
    status: 'active',
  }).returning()

  const eventId = dbEvent!.id

  // Fundraisers (no userId — seeded data, not linked to a Google account)
  const fundraiserData = [
    {
      name: 'Alex', goal: 3000, donation: 450,
      twitchUrl: 'https://twitch.tv/alex', donationUrl: 'https://example.com/donate/alex',
      catalogIds: ['sprint-interval', 'climb-simulation', 'no-sit', 'power-surge', 'cadence-challenge', 'hydration-lap', 'attack-mode', 'aero-tuck'],
      redeems: [
        { type: 'timed', category: 'fitness', redeemer: 'Viewer1', rewardName: 'Sprint Interval', requiredMs: 30000 },
        { type: 'counter', category: 'fitness', redeemer: 'Viewer2', rewardName: 'Power Surge', targetCount: 5 },
        { type: 'toggle', category: 'fitness', redeemer: 'Viewer3', rewardName: 'Attack Mode' },
      ],
    },
    {
      name: 'Jordan', goal: 2500, donation: 275,
      twitchUrl: 'https://twitch.tv/jordan', donationUrl: 'https://example.com/donate/jordan',
      catalogIds: ['climb-simulation', 'no-hands', 'low-gear-grind', 'one-leg-drill', 'push-ups', 'squats', 'plank', 'recovery-spin'],
      redeems: [
        { type: 'timed', category: 'challenge', redeemer: 'Viewer4', rewardName: 'Big Climb', requiredMs: 300000 },
        { type: 'counter', category: 'performance', redeemer: 'Viewer1', rewardName: 'Single Leg Drill', targetCount: 6 },
      ],
    },
    {
      name: 'Sam', goal: 2000, donation: 180,
      twitchUrl: 'https://twitch.tv/sam', donationUrl: 'https://example.com/donate/sam',
      catalogIds: ['sprint-interval', 'shortest-path-climb', 'song-request', 'dad-joke', 'truth-dare', 'shoutout', 'whisper-mode', 'snack-break'],
      redeems: [
        { type: 'instant', category: 'challenge', redeemer: 'Viewer5', rewardName: 'Shortest Path to Summit' },
        { type: 'banked', category: 'wellness', redeemer: 'Viewer2', rewardName: 'Snack Break', quantity: 3 },
      ],
    },
    {
      name: 'Riley', goal: 2500, donation: 320,
      twitchUrl: 'https://twitch.tv/riley', donationUrl: 'https://example.com/donate/riley',
      catalogIds: ['climb-simulation', 'no-sit', 'cadence-challenge', 'low-gear-grind', 'recovery-spin', 'hydration-lap', 'stretch-break', 'attack-mode'],
      redeems: [
        { type: 'timed', category: 'fitness', redeemer: 'Viewer3', rewardName: 'Out of Saddle', requiredMs: 60000 },
        { type: 'banked', category: 'wellness', redeemer: 'Viewer4', rewardName: 'Hydration Lap', quantity: 5 },
      ],
    },
  ]

  const colors = ['blue', 'emerald', 'amber', 'violet', 'rose', 'cyan', 'orange', 'teal']

  for (let i = 0; i < fundraiserData.length; i++) {
    const fd = fundraiserData[i]!
    const [dbFundraiser] = await db.insert(fundraisers).values({
      eventId,
      name: fd.name,
      avatarColor: colors[i % colors.length]!,
      goal: fd.goal,
      raised: fd.donation,
      twitchUrl: fd.twitchUrl,
      donationUrl: fd.donationUrl,
      rewardCatalogIds: fd.catalogIds,
    }).returning()

    const fid = dbFundraiser!.id

    for (const rd of fd.redeems) {
      const values: Record<string, any> = {
        fundraiserId: fid,
        type: rd.type,
        category: rd.category,
        redeemer: rd.redeemer,
        rewardName: rd.rewardName,
        status: 'active',
      }

      switch (rd.type) {
        case 'timed':
          values.requiredMs = (rd as any).requiredMs
          values.accumulatedMs = 0
          break
        case 'counter':
          values.targetCount = (rd as any).targetCount
          values.currentCount = 0
          break
        case 'banked':
          values.quantity = (rd as any).quantity
          values.totalRedeemed = (rd as any).quantity
          values.totalConsumed = 0
          break
        case 'toggle':
          break
        case 'instant':
          break
      }

      await db.insert(redeems).values(values)
    }
  }

  return { message: 'Database seeded successfully' }
})
