import type {
  GameEvent,
  Fundraiser,
  CreateEventPayload,
  UpdateEventPayload,
  CreateFundraiserPayload,
  UpdateFundraiserPayload,
} from '~/types/events'
import type { CreateRedeemPayload } from '~/types/redeems'
import * as ra from '~/utils/redeem-actions'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const AVATAR_COLORS = [
  'blue', 'emerald', 'amber', 'violet', 'rose', 'cyan', 'orange', 'teal',
]

export const useEventsStore = defineStore('events', {
  state: () => ({
    events: [] as GameEvent[],
    seeded: false,
  }),

  getters: {
    getEvent: (state) => {
      return (id: string): GameEvent | undefined =>
        state.events.find(e => e.id === id)
    },

    getFundraiser: (state) => {
      return (eventId: string, fundraiserId: string): Fundraiser | undefined => {
        const event = state.events.find(e => e.id === eventId)
        return event?.fundraisers.find(f => f.id === fundraiserId)
      }
    },

    eventRaised: (state) => {
      return (eventId: string): number => {
        const event = state.events.find(e => e.id === eventId)
        if (!event) return 0
        return event.fundraisers.reduce((sum, f) => sum + f.raised, 0)
      }
    },
  },

  actions: {
    // === Event CRUD ===
    createEvent(payload: CreateEventPayload): string {
      const now = new Date().toISOString()
      const id = generateId()
      this.events.push({
        id,
        name: payload.name,
        description: payload.description,
        goal: payload.goal,
        donationUrl: payload.donationUrl || '',
        status: 'active',
        fundraisers: [],
        createdAt: now,
        updatedAt: now,
      })
      return id
    },

    updateEvent(eventId: string, payload: UpdateEventPayload) {
      const event = this.events.find(e => e.id === eventId)
      if (!event) return
      if (payload.name !== undefined) event.name = payload.name
      if (payload.description !== undefined) event.description = payload.description
      if (payload.goal !== undefined) event.goal = payload.goal
      if (payload.donationUrl !== undefined) event.donationUrl = payload.donationUrl
      if (payload.status !== undefined) event.status = payload.status
      event.updatedAt = new Date().toISOString()
    },

    deleteEvent(eventId: string) {
      const idx = this.events.findIndex(e => e.id === eventId)
      if (idx !== -1) this.events.splice(idx, 1)
    },

    // === Fundraiser CRUD ===
    addFundraiser(eventId: string, payload: CreateFundraiserPayload): string | undefined {
      const event = this.events.find(e => e.id === eventId)
      if (!event) return
      const id = generateId()
      const now = new Date().toISOString()
      const colorIndex = event.fundraisers.length % AVATAR_COLORS.length
      event.fundraisers.push({
        id,
        eventId,
        name: payload.name,
        avatarColor: AVATAR_COLORS[colorIndex]!,
        goal: payload.goal,
        raised: 0,
        twitchUrl: payload.twitchUrl || '',
        donationUrl: payload.donationUrl || '',
        rewardCatalogIds: payload.rewardCatalogIds,
        redeems: [],
        createdAt: now,
        updatedAt: now,
      })
      event.updatedAt = now
      return id
    },

    updateFundraiser(eventId: string, fundraiserId: string, payload: UpdateFundraiserPayload) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      if (payload.name !== undefined) f.name = payload.name
      if (payload.goal !== undefined) f.goal = payload.goal
      if (payload.raised !== undefined) f.raised = payload.raised
      if (payload.twitchUrl !== undefined) f.twitchUrl = payload.twitchUrl
      if (payload.donationUrl !== undefined) f.donationUrl = payload.donationUrl
      f.updatedAt = new Date().toISOString()
    },

    deleteFundraiser(eventId: string, fundraiserId: string) {
      const event = this.events.find(e => e.id === eventId)
      if (!event) return
      const idx = event.fundraisers.findIndex(f => f.id === fundraiserId)
      if (idx !== -1) event.fundraisers.splice(idx, 1)
      event.updatedAt = new Date().toISOString()
    },

    addDonation(eventId: string, fundraiserId: string, amount: number) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      f.raised += amount
      f.updatedAt = new Date().toISOString()
    },

    // === Fundraiser Catalog ===
    addToCatalog(eventId: string, fundraiserId: string, presetId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f || f.rewardCatalogIds.includes(presetId)) return
      f.rewardCatalogIds.push(presetId)
    },

    removeFromCatalog(eventId: string, fundraiserId: string, presetId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      const idx = f.rewardCatalogIds.indexOf(presetId)
      if (idx !== -1) f.rewardCatalogIds.splice(idx, 1)
    },

    // === Fundraiser-scoped Redeem Actions ===
    addFundraiserRedeem(eventId: string, fundraiserId: string, payload: CreateRedeemPayload) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      ra.createRedeem(f.redeems, payload)
    },

    fundraiserStartTimer(eventId: string, fundraiserId: string, redeemId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      ra.startTimer(f.redeems, redeemId)
    },

    fundraiserPauseTimer(eventId: string, fundraiserId: string, redeemId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      ra.pauseTimer(f.redeems, redeemId)
    },

    fundraiserCompleteTimer(eventId: string, fundraiserId: string, redeemId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      ra.completeTimer(f.redeems, redeemId)
    },

    fundraiserConsumeBanked(eventId: string, fundraiserId: string, redeemId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      ra.consumeBanked(f.redeems, redeemId)
    },

    fundraiserAddToBanked(eventId: string, fundraiserId: string, redeemId: string, amount?: number) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      ra.addToBanked(f.redeems, redeemId, amount)
    },

    fundraiserCompleteInstant(eventId: string, fundraiserId: string, redeemId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      ra.completeInstant(f.redeems, redeemId)
    },

    fundraiserIncrementCounter(eventId: string, fundraiserId: string, redeemId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      ra.incrementCounter(f.redeems, redeemId)
    },

    fundraiserDecrementCounter(eventId: string, fundraiserId: string, redeemId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      ra.decrementCounter(f.redeems, redeemId)
    },

    fundraiserActivateToggle(eventId: string, fundraiserId: string, redeemId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      ra.activateToggle(f.redeems, redeemId)
    },

    fundraiserDeactivateToggle(eventId: string, fundraiserId: string, redeemId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      ra.deactivateToggle(f.redeems, redeemId)
    },

    fundraiserDeleteRedeem(eventId: string, fundraiserId: string, redeemId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      ra.deleteRedeem(f.redeems, redeemId)
    },

    fundraiserResetRedeem(eventId: string, fundraiserId: string, redeemId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      ra.resetRedeem(f.redeems, redeemId)
    },

    fundraiserUpdateNote(eventId: string, fundraiserId: string, redeemId: string, note: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      ra.updateNote(f.redeems, redeemId, note)
    },

    seedDefaultEvent() {
      if (this.seeded) return
      // Create the 4K4 2026 event
      const eventId = this.createEvent({
        name: '4K4 2026',
        description: 'Annual 4K4 charity cycling event. Ride hard, raise funds, unlock rewards!',
        goal: 10000,
        donationUrl: 'https://kilometers4kiddos.org/',
      })

      // Fundraiser 1: Alex — cycling-focused rewards
      const alexId = this.addFundraiser(eventId, {
        name: 'Alex',
        goal: 3000,
        twitchUrl: 'https://twitch.tv/alex',
        donationUrl: 'https://example.com/donate/alex',
        rewardCatalogIds: [
          'sprint-interval', 'climb-simulation', 'no-sit', 'power-surge',
          'cadence-challenge', 'hydration-lap', 'attack-mode', 'aero-tuck',
        ],
      })

      // Fundraiser 2: Jordan — mixed challenge + fitness
      const jordanId = this.addFundraiser(eventId, {
        name: 'Jordan',
        goal: 2500,
        twitchUrl: 'https://twitch.tv/jordan',
        donationUrl: 'https://example.com/donate/jordan',
        rewardCatalogIds: [
          'climb-simulation', 'no-hands', 'low-gear-grind', 'one-leg-drill',
          'push-ups', 'squats', 'plank', 'recovery-spin',
        ],
      })

      // Fundraiser 3: Sam — entertainment + social
      const samId = this.addFundraiser(eventId, {
        name: 'Sam',
        goal: 2000,
        twitchUrl: 'https://twitch.tv/sam',
        donationUrl: 'https://example.com/donate/sam',
        rewardCatalogIds: [
          'sprint-interval', 'shortest-path-climb', 'song-request', 'dad-joke',
          'truth-dare', 'shoutout', 'whisper-mode', 'snack-break',
        ],
      })

      // Fundraiser 4: Riley — endurance focused
      const rileyId = this.addFundraiser(eventId, {
        name: 'Riley',
        goal: 2500,
        twitchUrl: 'https://twitch.tv/riley',
        donationUrl: 'https://example.com/donate/riley',
        rewardCatalogIds: [
          'climb-simulation', 'no-sit', 'cadence-challenge', 'low-gear-grind',
          'recovery-spin', 'hydration-lap', 'stretch-break', 'attack-mode',
        ],
      })

      // Add some starting donations
      if (alexId) this.addDonation(eventId, alexId, 450)
      if (jordanId) this.addDonation(eventId, jordanId, 275)
      if (samId) this.addDonation(eventId, samId, 180)
      if (rileyId) this.addDonation(eventId, rileyId, 320)

      // Seed some active redeems for Alex
      if (alexId) {
        this.addFundraiserRedeem(eventId, alexId, { type: 'timed', category: 'fitness', redeemer: 'Viewer1', rewardName: 'Sprint Interval', requiredMs: 30000 })
        this.addFundraiserRedeem(eventId, alexId, { type: 'counter', category: 'fitness', redeemer: 'Viewer2', rewardName: 'Power Surge', targetCount: 5 })
        this.addFundraiserRedeem(eventId, alexId, { type: 'toggle', category: 'fitness', redeemer: 'Viewer3', rewardName: 'Attack Mode' })
      }

      // Seed some active redeems for Jordan
      if (jordanId) {
        this.addFundraiserRedeem(eventId, jordanId, { type: 'timed', category: 'challenge', redeemer: 'Viewer4', rewardName: 'Big Climb', requiredMs: 300000 })
        this.addFundraiserRedeem(eventId, jordanId, { type: 'counter', category: 'performance', redeemer: 'Viewer1', rewardName: 'Single Leg Drill', targetCount: 6 })
      }

      // Seed some active redeems for Sam
      if (samId) {
        this.addFundraiserRedeem(eventId, samId, { type: 'instant', category: 'challenge', redeemer: 'Viewer5', rewardName: 'Shortest Path to Summit' })
        this.addFundraiserRedeem(eventId, samId, { type: 'banked', category: 'wellness', redeemer: 'Viewer2', rewardName: 'Snack Break', quantity: 3 })
      }

      // Seed some active redeems for Riley
      if (rileyId) {
        this.addFundraiserRedeem(eventId, rileyId, { type: 'timed', category: 'fitness', redeemer: 'Viewer3', rewardName: 'Out of Saddle', requiredMs: 60000 })
        this.addFundraiserRedeem(eventId, rileyId, { type: 'banked', category: 'wellness', redeemer: 'Viewer4', rewardName: 'Hydration Lap', quantity: 5 })
      }

      this.seeded = true
    },

    // Internal helper
    _findFundraiser(eventId: string, fundraiserId: string): Fundraiser | undefined {
      const event = this.events.find(e => e.id === eventId)
      return event?.fundraisers.find(f => f.id === fundraiserId)
    },
  },

  persist: true,
})
