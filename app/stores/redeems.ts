import type {
  Redeem,
  CreateRedeemPayload,
  TimedRedeem,
  BankedRedeem,
  CounterRedeem,
  RedeemType,
} from '~/types/redeems'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const useRedeemsStore = defineStore('redeems', {
  state: () => ({
    redeems: [] as Redeem[],
    seeded: false,
    searchQuery: '',
    typeFilter: null as RedeemType | null,
    statusFilter: 'all' as 'all' | 'active' | 'completed',
  }),

  getters: {
    filteredRedeems(state): Redeem[] {
      let result = state.redeems

      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase()
        result = result.filter(
          r =>
            r.rewardName.toLowerCase().includes(q)
            || r.redeemer.toLowerCase().includes(q)
            || r.note.toLowerCase().includes(q),
        )
      }

      if (state.typeFilter) {
        result = result.filter(r => r.type === state.typeFilter)
      }

      if (state.statusFilter !== 'all') {
        if (state.statusFilter === 'active') {
          result = result.filter(r => r.status !== 'completed')
        }
        else {
          result = result.filter(r => r.status === 'completed')
        }
      }

      return result.slice().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    },

    activeCount(state): number {
      return state.redeems.filter(r => r.status !== 'completed').length
    },

    completedCount(state): number {
      return state.redeems.filter(r => r.status === 'completed').length
    },

    totalCount(state): number {
      return state.redeems.length
    },

    recentRedeemers(state): string[] {
      const seen = new Set<string>()
      const result: string[] = []
      for (const r of [...state.redeems].reverse()) {
        const name = r.redeemer.toLowerCase()
        if (!seen.has(name)) {
          seen.add(name)
          result.push(r.redeemer)
        }
      }
      return result
    },

    countByType(state): Record<RedeemType, { total: number, active: number, completed: number }> {
      const types: RedeemType[] = ['timed', 'banked', 'instant', 'counter', 'toggle']
      const result = {} as Record<RedeemType, { total: number, active: number, completed: number }>
      for (const t of types) {
        const ofType = state.redeems.filter(r => r.type === t)
        result[t] = {
          total: ofType.length,
          active: ofType.filter(r => r.status !== 'completed').length,
          completed: ofType.filter(r => r.status === 'completed').length,
        }
      }
      return result
    },

    leaderboard(state): { redeemer: string, total: number, completed: number, active: number }[] {
      const map = new Map<string, { redeemer: string, total: number, completed: number, active: number }>()
      for (const r of state.redeems) {
        const key = r.redeemer.toLowerCase()
        const entry = map.get(key) || { redeemer: r.redeemer, total: 0, completed: 0, active: 0 }
        entry.total++
        if (r.status === 'completed') entry.completed++
        else entry.active++
        map.set(key, entry)
      }
      return [...map.values()].sort((a, b) => b.total - a.total || a.redeemer.localeCompare(b.redeemer))
    },
  },

  actions: {
    seedDefaultRedeems() {
      if (this.seeded) return
      const defaults: CreateRedeemPayload[] = [
        { type: 'timed', redeemer: 'Alex', rewardName: 'Sprint Interval', requiredMs: 30000 },
        { type: 'timed', redeemer: 'Jordan', rewardName: 'Big Climb', requiredMs: 300000 },
        { type: 'counter', redeemer: 'Alex', rewardName: 'Power Surge', targetCount: 5 },
        { type: 'toggle', redeemer: 'Sam', rewardName: 'Attack Mode' },
        { type: 'timed', redeemer: 'Jordan', rewardName: 'Out of Saddle', requiredMs: 60000 },
        { type: 'banked', redeemer: 'Alex', rewardName: 'Hydration Lap', quantity: 5 },
        { type: 'instant', redeemer: 'Sam', rewardName: 'Shortest Path to Summit' },
        { type: 'timed', redeemer: 'Sam', rewardName: 'High Cadence', requiredMs: 120000 },
        { type: 'counter', redeemer: 'Jordan', rewardName: 'Single Leg Drill', targetCount: 6 },
      ]
      for (const payload of defaults) {
        this.addRedeem(payload)
      }
      this.seeded = true
    },

    addRedeem(payload: CreateRedeemPayload) {
      const now = new Date().toISOString()
      const base = {
        id: generateId(),
        redeemer: payload.redeemer,
        rewardName: payload.rewardName,
        note: payload.note || '',
        createdAt: now,
        updatedAt: now,
      }

      switch (payload.type) {
        case 'timed':
          this.redeems.push({
            ...base,
            type: 'timed',
            status: 'paused',
            requiredMs: payload.requiredMs,
            accumulatedMs: 0,
            timerStartedAt: null,
          })
          break

        case 'banked': {
          const existing = this.redeems.find(
            r =>
              r.type === 'banked'
              && r.redeemer === payload.redeemer
              && r.rewardName === payload.rewardName
              && r.status !== 'completed',
          ) as BankedRedeem | undefined

          if (existing) {
            existing.quantity += payload.quantity
            existing.totalRedeemed += payload.quantity
            existing.updatedAt = now
          }
          else {
            this.redeems.push({
              ...base,
              type: 'banked',
              status: 'active',
              quantity: payload.quantity,
              totalRedeemed: payload.quantity,
              totalConsumed: 0,
            })
          }
          break
        }

        case 'instant':
          this.redeems.push({
            ...base,
            type: 'instant',
            status: 'active',
            completedAt: null,
          })
          break

        case 'counter':
          this.redeems.push({
            ...base,
            type: 'counter',
            status: 'active',
            targetCount: payload.targetCount,
            currentCount: 0,
          })
          break

        case 'toggle':
          this.redeems.push({
            ...base,
            type: 'toggle',
            status: 'active',
            activatedAt: null,
            deactivatedAt: null,
          })
          break
      }
    },

    // Timer actions
    startTimer(id: string) {
      const r = this.redeems.find(r => r.id === id) as TimedRedeem | undefined
      if (!r || r.type !== 'timed') return
      r.timerStartedAt = new Date().toISOString()
      r.status = 'active'
      r.updatedAt = new Date().toISOString()
    },

    pauseTimer(id: string) {
      const r = this.redeems.find(r => r.id === id) as TimedRedeem | undefined
      if (!r || r.type !== 'timed' || !r.timerStartedAt) return
      r.accumulatedMs += Date.now() - new Date(r.timerStartedAt).getTime()
      r.timerStartedAt = null
      r.status = 'paused'
      r.updatedAt = new Date().toISOString()
    },

    completeTimer(id: string) {
      const r = this.redeems.find(r => r.id === id) as TimedRedeem | undefined
      if (!r || r.type !== 'timed') return
      if (r.timerStartedAt) {
        r.accumulatedMs += Date.now() - new Date(r.timerStartedAt).getTime()
        r.timerStartedAt = null
      }
      r.status = 'completed'
      r.updatedAt = new Date().toISOString()
    },

    // Banked actions
    consumeBanked(id: string) {
      const r = this.redeems.find(r => r.id === id) as BankedRedeem | undefined
      if (!r || r.type !== 'banked' || r.quantity <= 0) return
      r.quantity--
      r.totalConsumed++
      if (r.quantity === 0) r.status = 'completed'
      r.updatedAt = new Date().toISOString()
    },

    addToBanked(id: string, amount: number = 1) {
      const r = this.redeems.find(r => r.id === id) as BankedRedeem | undefined
      if (!r || r.type !== 'banked') return
      r.quantity += amount
      r.totalRedeemed += amount
      if (r.status === 'completed') r.status = 'active'
      r.updatedAt = new Date().toISOString()
    },

    // Instant actions
    completeInstant(id: string) {
      const r = this.redeems.find(r => r.id === id)
      if (!r || r.type !== 'instant') return
      r.completedAt = new Date().toISOString()
      r.status = 'completed'
      r.updatedAt = new Date().toISOString()
    },

    // Counter actions
    incrementCounter(id: string) {
      const r = this.redeems.find(r => r.id === id) as CounterRedeem | undefined
      if (!r || r.type !== 'counter' || r.status === 'completed') return
      r.currentCount++
      if (r.currentCount >= r.targetCount) r.status = 'completed'
      r.updatedAt = new Date().toISOString()
    },

    decrementCounter(id: string) {
      const r = this.redeems.find(r => r.id === id) as CounterRedeem | undefined
      if (!r || r.type !== 'counter' || r.currentCount <= 0) return
      r.currentCount--
      if (r.status === 'completed') r.status = 'active'
      r.updatedAt = new Date().toISOString()
    },

    // Toggle actions
    activateToggle(id: string) {
      const r = this.redeems.find(r => r.id === id)
      if (!r || r.type !== 'toggle') return
      r.activatedAt = new Date().toISOString()
      r.deactivatedAt = null
      r.status = 'active'
      r.updatedAt = new Date().toISOString()
    },

    deactivateToggle(id: string) {
      const r = this.redeems.find(r => r.id === id)
      if (!r || r.type !== 'toggle') return
      r.deactivatedAt = new Date().toISOString()
      r.status = 'completed'
      r.updatedAt = new Date().toISOString()
    },

    // General actions
    deleteRedeem(id: string) {
      const idx = this.redeems.findIndex(r => r.id === id)
      if (idx !== -1) this.redeems.splice(idx, 1)
    },

    resetRedeem(id: string) {
      const r = this.redeems.find(r => r.id === id)
      if (!r) return
      const now = new Date().toISOString()
      switch (r.type) {
        case 'timed':
          r.status = 'paused'
          r.accumulatedMs = 0
          r.timerStartedAt = null
          break
        case 'banked':
          r.quantity = r.totalRedeemed
          r.totalConsumed = 0
          r.status = 'active'
          break
        case 'instant':
          r.status = 'active'
          r.completedAt = null
          break
        case 'counter':
          r.currentCount = 0
          r.status = 'active'
          break
        case 'toggle':
          r.activatedAt = null
          r.deactivatedAt = null
          r.status = 'active'
          break
      }
      r.updatedAt = now
    },

    updateNote(id: string, note: string) {
      const r = this.redeems.find(r => r.id === id)
      if (!r) return
      r.note = note
      r.updatedAt = new Date().toISOString()
    },
  },

  persist: true,
})
