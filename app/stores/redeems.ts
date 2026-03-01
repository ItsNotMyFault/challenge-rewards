import type {
  Redeem,
} from '~/types/redeems'
import type { RewardCategory } from '~/types/rewards'

export const useRedeemsStore = defineStore('redeems', {
  state: () => ({
    redeems: [] as Redeem[],
    loading: false,
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
    async fetchRedeems() {
      this.loading = true
      try {
        this.redeems = await $fetch<Redeem[]>('/api/redeems')
      }
      finally {
        this.loading = false
      }
    },

    // Generic redeem action helper — looks up fundraiserId from the redeem
    async _redeemAction(id: string, action: string, params?: Record<string, any>) {
      const redeem = this.redeems.find(r => r.id === id)
      if (!redeem?.fundraiserId) return
      await $fetch(`/api/fundraisers/${redeem.fundraiserId}/redeems/${id}`, {
        method: 'PATCH',
        body: { action, ...params },
      })
      await this.fetchRedeems()
    },

    async startTimer(id: string) { return this._redeemAction(id, 'startTimer') },
    async pauseTimer(id: string) { return this._redeemAction(id, 'pauseTimer') },
    async completeTimer(id: string) { return this._redeemAction(id, 'completeTimer') },

    async consumeBanked(id: string) { return this._redeemAction(id, 'consumeBanked') },
    async addToBanked(id: string, amount: number = 1) { return this._redeemAction(id, 'addToBanked', { amount }) },

    async completeInstant(id: string) { return this._redeemAction(id, 'completeInstant') },

    async incrementCounter(id: string) { return this._redeemAction(id, 'incrementCounter') },
    async decrementCounter(id: string) { return this._redeemAction(id, 'decrementCounter') },

    async activateToggle(id: string) { return this._redeemAction(id, 'activateToggle') },
    async deactivateToggle(id: string) { return this._redeemAction(id, 'deactivateToggle') },

    async deleteRedeem(id: string) {
      const redeem = this.redeems.find(r => r.id === id)
      if (!redeem?.fundraiserId) return
      await $fetch(`/api/fundraisers/${redeem.fundraiserId}/redeems/${id}`, { method: 'DELETE' })
      await this.fetchRedeems()
    },

    async resetRedeem(id: string) { return this._redeemAction(id, 'resetRedeem') },
    async updateNote(id: string, note: string) { return this._redeemAction(id, 'updateNote', { note }) },
  },
})
