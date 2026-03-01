import { pgTable, serial, text, boolean, integer, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  googleId: text('google_id').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  isAdmin: boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  goal: integer('goal').notNull(),
  donationUrl: text('donation_url').notNull().default(''),
  status: text('status').notNull().default('active'), // draft | active | completed
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const fundraisers = pgTable('fundraisers', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  avatarColor: text('avatar_color').notNull().default('blue'),
  goal: integer('goal').notNull(),
  raised: integer('raised').notNull().default(0),
  twitchUrl: text('twitch_url').notNull().default(''),
  donationUrl: text('donation_url').notNull().default(''),
  rewardCatalogIds: jsonb('reward_catalog_ids').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const redeems = pgTable('redeems', {
  id: serial('id').primaryKey(),
  fundraiserId: integer('fundraiser_id').notNull().references(() => fundraisers.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // timed | banked | instant | counter | toggle
  category: text('category').notNull(),
  redeemer: text('redeemer').notNull(),
  rewardName: text('reward_name').notNull(),
  note: text('note').notNull().default(''),
  status: text('status').notNull().default('active'), // active | paused | completed

  // Timed fields
  requiredMs: integer('required_ms'),
  accumulatedMs: integer('accumulated_ms'),
  timerStartedAt: timestamp('timer_started_at', { withTimezone: true }),

  // Banked fields
  quantity: integer('quantity'),
  totalRedeemed: integer('total_redeemed'),
  totalConsumed: integer('total_consumed'),

  // Instant fields
  completedAt: timestamp('completed_at', { withTimezone: true }),

  // Counter fields
  targetCount: integer('target_count'),
  currentCount: integer('current_count'),

  // Toggle fields
  activatedAt: timestamp('activated_at', { withTimezone: true }),
  deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const rewards = pgTable('rewards', {
  id: serial('id').primaryKey(),
  presetId: text('preset_id').unique(), // null for custom, string for seeded presets
  rewardName: text('reward_name').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull().default(''),
  icon: text('icon').notNull().default(''),
  category: text('category').notNull(),

  // Type-specific defaults
  requiredMs: integer('required_ms'),
  quantity: integer('quantity'),
  targetCount: integer('target_count'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
