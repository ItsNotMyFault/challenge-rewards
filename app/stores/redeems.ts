import type {
  Redeem,
  CreateRedeemPayload,
} from '~/types/redeems'
import type { RewardCategory } from '~/types/rewards'
import presetData from '~/data/redeem-presets.json'
import * as ra from '~/utils/redeem-actions'

export const useRedeemsStore = defineStore('redeems', {
  state: () => ({
    redeems: [] as Redeem[],
    seeded: false,
    searchQuery: '',
    categoryFilter: null as RewardCategory | null,
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

      if (state.categoryFilter) {
        result = result.filter(r => r.category === state.categoryFilter)
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

    countByCategory(state): Record<RewardCategory, { total: number, active: number, completed: number }> {
      const categories: RewardCategory[] = ['challenge', 'fitness', 'cosmetic', 'entertainment', 'performance', 'social', 'wellness']
      const result = {} as Record<RewardCategory, { total: number, active: number, completed: number }>
      for (const c of categories) {
        const ofCat = state.redeems.filter(r => r.category === c)
        result[c] = {
          total: ofCat.length,
          active: ofCat.filter(r => r.status !== 'completed').length,
          completed: ofCat.filter(r => r.status === 'completed').length,
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
    migrateCategories() {
      const categoryMap = new Map<string, RewardCategory>()
      for (const p of presetData.presets) {
        categoryMap.set(p.rewardName, p.category as RewardCategory)
      }
      for (const r of this.redeems) {
        if (!r.category) {
          ;(r as any).category = categoryMap.get(r.rewardName) || 'challenge'
        }
      }
    },

    seedDefaultRedeems() {
      if (this.seeded) return
      const defaults: CreateRedeemPayload[] = [
        { type: 'timed', category: 'fitness', redeemer: 'Alex', rewardName: 'Sprint Interval', requiredMs: 30000 },
        { type: 'timed', category: 'challenge', redeemer: 'Jordan', rewardName: 'Big Climb', requiredMs: 300000 },
        { type: 'counter', category: 'fitness', redeemer: 'Alex', rewardName: 'Power Surge', targetCount: 5 },
        { type: 'toggle', category: 'fitness', redeemer: 'Sam', rewardName: 'Attack Mode' },
        { type: 'timed', category: 'fitness', redeemer: 'Jordan', rewardName: 'Out of Saddle', requiredMs: 60000 },
        { type: 'banked', category: 'wellness', redeemer: 'Alex', rewardName: 'Hydration Lap', quantity: 5 },
        { type: 'instant', category: 'challenge', redeemer: 'Sam', rewardName: 'Shortest Path to Summit' },
        { type: 'timed', category: 'performance', redeemer: 'Sam', rewardName: 'High Cadence', requiredMs: 120000 },
        { type: 'counter', category: 'performance', redeemer: 'Jordan', rewardName: 'Single Leg Drill', targetCount: 6 },
      ]
      for (const payload of defaults) {
        this.addRedeem(payload)
      }
      this.seeded = true
    },

    addRedeem(payload: CreateRedeemPayload) {
      ra.createRedeem(this.redeems, payload)
    },

    startTimer(id: string) { ra.startTimer(this.redeems, id) },
    pauseTimer(id: string) { ra.pauseTimer(this.redeems, id) },
    completeTimer(id: string) { ra.completeTimer(this.redeems, id) },

    consumeBanked(id: string) { ra.consumeBanked(this.redeems, id) },
    addToBanked(id: string, amount: number = 1) { ra.addToBanked(this.redeems, id, amount) },

    completeInstant(id: string) { ra.completeInstant(this.redeems, id) },

    incrementCounter(id: string) { ra.incrementCounter(this.redeems, id) },
    decrementCounter(id: string) { ra.decrementCounter(this.redeems, id) },

    activateToggle(id: string) { ra.activateToggle(this.redeems, id) },
    deactivateToggle(id: string) { ra.deactivateToggle(this.redeems, id) },

    deleteRedeem(id: string) { ra.deleteRedeem(this.redeems, id) },
    resetRedeem(id: string) { ra.resetRedeem(this.redeems, id) },
    updateNote(id: string, note: string) { ra.updateNote(this.redeems, id, note) },
  },

  persist: true,
})
