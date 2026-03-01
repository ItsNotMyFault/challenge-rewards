import type {
  GameEvent,
  Fundraiser,
  CreateEventPayload,
  UpdateEventPayload,
  CreateFundraiserPayload,
  UpdateFundraiserPayload,
} from '~/types/events'
import type { CreateRedeemPayload } from '~/types/redeems'

export const useEventsStore = defineStore('events', {
  state: () => ({
    events: [] as GameEvent[],
    loading: false,
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
        if (event.raised !== undefined) return event.raised
        return event.fundraisers.reduce((sum, f) => sum + f.raised, 0)
      }
    },
  },

  actions: {
    // === Data Fetching ===
    async fetchEvents() {
      this.loading = true
      try {
        const data = await $fetch<any[]>('/api/events')
        this.events = data.map(e => ({
          id: e.id,
          name: e.name,
          description: e.description,
          goal: e.goal,
          donationUrl: e.donationUrl,
          status: e.status,
          fundraisers: this.events.find(ex => ex.id === e.id)?.fundraisers ?? [],
          fundraiserCount: e.fundraiserCount,
          raised: e.raised,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        }))
      }
      finally {
        this.loading = false
      }
    },

    async fetchEvent(id: string) {
      const data = await $fetch<GameEvent>(`/api/events/${id}`)
      const idx = this.events.findIndex(e => e.id === id)
      if (idx !== -1) {
        this.events[idx] = data
      }
      else {
        this.events.push(data)
      }
      return data
    },

    // === Event CRUD ===
    async createEvent(payload: CreateEventPayload): Promise<string> {
      const data = await $fetch<any>('/api/events', { method: 'POST', body: payload })
      this.events.push({ ...data, fundraisers: [] })
      return String(data.id)
    },

    async updateEvent(eventId: string, payload: UpdateEventPayload) {
      const data = await $fetch<any>(`/api/events/${eventId}`, { method: 'PATCH', body: payload })
      const event = this.events.find(e => e.id === eventId)
      if (event) {
        event.name = data.name
        event.description = data.description
        event.goal = data.goal
        event.donationUrl = data.donationUrl
        event.status = data.status
        event.updatedAt = data.updatedAt
      }
    },

    async deleteEvent(eventId: string) {
      await $fetch(`/api/events/${eventId}`, { method: 'DELETE' })
      const idx = this.events.findIndex(e => e.id === eventId)
      if (idx !== -1) this.events.splice(idx, 1)
    },

    // === Fundraiser CRUD ===
    async addFundraiser(eventId: string, payload: CreateFundraiserPayload): Promise<string> {
      const data = await $fetch<any>('/api/fundraisers', {
        method: 'POST',
        body: { ...payload, eventId },
      })
      await this.fetchEvent(eventId)
      return String(data.id)
    },

    async updateFundraiser(eventId: string, fundraiserId: string, payload: UpdateFundraiserPayload) {
      await $fetch(`/api/fundraisers/${fundraiserId}`, { method: 'PATCH', body: payload })
      await this.fetchEvent(eventId)
    },

    async deleteFundraiser(eventId: string, fundraiserId: string) {
      await $fetch(`/api/fundraisers/${fundraiserId}`, { method: 'DELETE' })
      await this.fetchEvent(eventId)
    },

    async addDonation(eventId: string, fundraiserId: string, amount: number) {
      await $fetch(`/api/fundraisers/${fundraiserId}/donation`, { method: 'POST', body: { amount } })
      await this.fetchEvent(eventId)
    },

    // === Fundraiser Catalog ===
    async addToCatalog(eventId: string, fundraiserId: string, presetId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f || f.rewardCatalogIds.includes(presetId)) return
      const newIds = [...f.rewardCatalogIds, presetId]
      await $fetch(`/api/fundraisers/${fundraiserId}`, {
        method: 'PATCH',
        body: { rewardCatalogIds: newIds },
      })
      f.rewardCatalogIds = newIds
    },

    async removeFromCatalog(eventId: string, fundraiserId: string, presetId: string) {
      const f = this._findFundraiser(eventId, fundraiserId)
      if (!f) return
      const newIds = f.rewardCatalogIds.filter(id => id !== presetId)
      await $fetch(`/api/fundraisers/${fundraiserId}`, {
        method: 'PATCH',
        body: { rewardCatalogIds: newIds },
      })
      f.rewardCatalogIds = newIds
    },

    // === Fundraiser-scoped Redeem Actions ===
    async addFundraiserRedeem(eventId: string, fundraiserId: string, payload: CreateRedeemPayload) {
      await $fetch(`/api/fundraisers/${fundraiserId}/redeems`, { method: 'POST', body: payload })
      await this.fetchEvent(eventId)
    },

    async _redeemAction(eventId: string, fundraiserId: string, redeemId: string, action: string, params?: Record<string, any>) {
      await $fetch(`/api/fundraisers/${fundraiserId}/redeems/${redeemId}`, {
        method: 'PATCH',
        body: { action, ...params },
      })
      await this.fetchEvent(eventId)
    },

    async fundraiserStartTimer(eId: string, fId: string, rId: string) {
      return this._redeemAction(eId, fId, rId, 'startTimer')
    },
    async fundraiserPauseTimer(eId: string, fId: string, rId: string) {
      return this._redeemAction(eId, fId, rId, 'pauseTimer')
    },
    async fundraiserCompleteTimer(eId: string, fId: string, rId: string) {
      return this._redeemAction(eId, fId, rId, 'completeTimer')
    },
    async fundraiserConsumeBanked(eId: string, fId: string, rId: string) {
      return this._redeemAction(eId, fId, rId, 'consumeBanked')
    },
    async fundraiserAddToBanked(eId: string, fId: string, rId: string, amount?: number) {
      return this._redeemAction(eId, fId, rId, 'addToBanked', { amount })
    },
    async fundraiserCompleteInstant(eId: string, fId: string, rId: string) {
      return this._redeemAction(eId, fId, rId, 'completeInstant')
    },
    async fundraiserIncrementCounter(eId: string, fId: string, rId: string) {
      return this._redeemAction(eId, fId, rId, 'incrementCounter')
    },
    async fundraiserDecrementCounter(eId: string, fId: string, rId: string) {
      return this._redeemAction(eId, fId, rId, 'decrementCounter')
    },
    async fundraiserActivateToggle(eId: string, fId: string, rId: string) {
      return this._redeemAction(eId, fId, rId, 'activateToggle')
    },
    async fundraiserDeactivateToggle(eId: string, fId: string, rId: string) {
      return this._redeemAction(eId, fId, rId, 'deactivateToggle')
    },
    async fundraiserDeleteRedeem(eId: string, fId: string, rId: string) {
      await $fetch(`/api/fundraisers/${fId}/redeems/${rId}`, { method: 'DELETE' })
      await this.fetchEvent(eId)
    },
    async fundraiserResetRedeem(eId: string, fId: string, rId: string) {
      return this._redeemAction(eId, fId, rId, 'resetRedeem')
    },
    async fundraiserUpdateNote(eId: string, fId: string, rId: string, note: string) {
      return this._redeemAction(eId, fId, rId, 'updateNote', { note })
    },

    // Internal helper
    _findFundraiser(eventId: string, fundraiserId: string): Fundraiser | undefined {
      const event = this.events.find(e => e.id === eventId)
      return event?.fundraisers.find(f => f.id === fundraiserId)
    },
  },
})
