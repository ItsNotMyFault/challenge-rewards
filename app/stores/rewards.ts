import type {
  RewardTemplate,
  RewardCategory,
  CreateRewardPayload,
  UpdateRewardPayload,
} from '~/types/rewards'
import type { RedeemType } from '~/types/redeems'

export const useRewardsStore = defineStore('rewards', {
  state: () => ({
    rewards: [] as RewardTemplate[],
    loading: false,
    searchQuery: '',
    categoryFilter: null as RewardCategory | null,
    typeFilter: null as RedeemType | null,
  }),

  getters: {
    filteredRewards(state): RewardTemplate[] {
      let result = state.rewards

      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase()
        result = result.filter(
          r =>
            r.rewardName.toLowerCase().includes(q)
            || r.description.toLowerCase().includes(q),
        )
      }

      if (state.categoryFilter) {
        result = result.filter(r => r.category === state.categoryFilter)
      }

      if (state.typeFilter) {
        result = result.filter(r => r.type === state.typeFilter)
      }

      return result.slice().sort((a, b) => a.rewardName.localeCompare(b.rewardName))
    },

    totalCount(state): number {
      return state.rewards.length
    },
  },

  actions: {
    async fetchRewards() {
      this.loading = true
      try {
        this.rewards = await $fetch<RewardTemplate[]>('/api/rewards')
      }
      finally {
        this.loading = false
      }
    },

    async addReward(payload: CreateRewardPayload): Promise<string> {
      const data = await $fetch<any>('/api/rewards', { method: 'POST', body: payload })
      await this.fetchRewards()
      return String(data.id)
    },

    async updateReward(id: string, payload: UpdateRewardPayload) {
      await $fetch(`/api/rewards/${id}`, { method: 'PATCH', body: payload })
      await this.fetchRewards()
    },

    async deleteReward(id: string) {
      await $fetch(`/api/rewards/${id}`, { method: 'DELETE' })
      const idx = this.rewards.findIndex(r => r.id === id)
      if (idx !== -1) this.rewards.splice(idx, 1)
    },
  },
})
