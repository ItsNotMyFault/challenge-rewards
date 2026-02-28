import type {
  RewardTemplate,
  RewardCategory,
  CreateRewardPayload,
  UpdateRewardPayload,
} from '~/types/rewards'
import type { RedeemType } from '~/types/redeems'
import presetData from '~/data/redeem-presets.json'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const useRewardsStore = defineStore('rewards', {
  state: () => ({
    rewards: [] as RewardTemplate[],
    seeded: false,
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
    seedFromPresets() {
      if (this.seeded) return
      const now = new Date().toISOString()
      for (const preset of presetData.presets) {
        this.rewards.push({
          ...preset,
          createdAt: now,
          updatedAt: now,
        } as RewardTemplate)
      }
      this.seeded = true
    },

    addReward(payload: CreateRewardPayload): string {
      const now = new Date().toISOString()
      const id = generateId()
      this.rewards.push({
        ...payload,
        id,
        createdAt: now,
        updatedAt: now,
      } as RewardTemplate)
      return id
    },

    updateReward(id: string, payload: UpdateRewardPayload) {
      const r = this.rewards.find(r => r.id === id)
      if (!r) return
      Object.assign(r, payload, { updatedAt: new Date().toISOString() })
    },

    deleteReward(id: string) {
      const idx = this.rewards.findIndex(r => r.id === id)
      if (idx !== -1) this.rewards.splice(idx, 1)
    },
  },

  persist: true,
})
