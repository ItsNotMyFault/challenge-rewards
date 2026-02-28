import challengeData from '~/data/challenges.json'
import type { SkillTreeData } from '~/types/challenges'

export const useChallengesStore = defineStore('challenges', {
  state: () => ({
    completedSkillTreeIds: [] as string[],
    completedMonthlyIds: [] as string[],
  }),

  getters: {
    totalSkillTreeChallenges(): number {
      return (challengeData as SkillTreeData).nodes.length
    },

    completedSkillTreeCount(state): number {
      return state.completedSkillTreeIds.length
    },

    skillTreeProgressPercent(): number {
      if (this.totalSkillTreeChallenges === 0) return 0
      return Math.round(
        (this.completedSkillTreeCount / this.totalSkillTreeChallenges) * 100,
      )
    },

    isSkillTreeChallengeCompleted(state) {
      return (id: string) => state.completedSkillTreeIds.includes(id)
    },

    isMonthlySubChallengeCompleted(state) {
      return (id: string) => state.completedMonthlyIds.includes(id)
    },
  },

  actions: {
    toggleSkillTreeChallenge(id: string) {
      const idx = this.completedSkillTreeIds.indexOf(id)
      if (idx === -1) {
        this.completedSkillTreeIds.push(id)
      }
      else {
        this.completedSkillTreeIds.splice(idx, 1)
      }
    },

    toggleMonthlySubChallenge(id: string) {
      const idx = this.completedMonthlyIds.indexOf(id)
      if (idx === -1) {
        this.completedMonthlyIds.push(id)
      }
      else {
        this.completedMonthlyIds.splice(idx, 1)
      }
    },
  },

  persist: true,
})
