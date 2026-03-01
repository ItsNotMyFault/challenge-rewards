<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import type { SkillTreeNode } from '~/types/challenges'
import challengeData from '~/data/challenges.json'

const store = useChallengesStore()

const activeTab = ref('skill-tree')
const tabItems: TabsItem[] = [
  { label: 'Skill Tree', icon: 'i-lucide-git-branch', value: 'skill-tree' },
  { label: 'Monthly Challenges', icon: 'i-lucide-calendar', value: 'monthly' },
]

const detailModalOpen = ref(false)
const selectedChallenge = ref<SkillTreeNode | null>(null)

function onNodeClick(node: { id: string; label: string; description: string; category: string }) {
  const found = challengeData.nodes.find(n => n.id === node.id) as SkillTreeNode | undefined
  selectedChallenge.value = found ?? null
  detailModalOpen.value = true
}

const skillTreeRef = ref()

watch(activeTab, (val) => {
  if (val === 'skill-tree') {
    nextTick(() => {
      if (typeof skillTreeRef.value?.resize === 'function') {
        skillTreeRef.value.resize()
      }
    })
  }
})
</script>

<template>
  <div class="skill-tree-page">
    <!-- Tabs + Progress -->
    <div class="flex shrink-0 items-center justify-between px-5 py-2">
      <UTabs
        v-model="activeTab"
        :items="tabItems"
        :content="false"
        variant="pill"
        color="neutral"
      />
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-500">{{ store.completedSkillTreeCount }} / {{ store.totalSkillTreeChallenges }}</span>
        <UProgress
          :model-value="store.completedSkillTreeCount"
          :max="store.totalSkillTreeChallenges"
          size="xs"
          class="w-32"
        />
        <span class="text-xs font-medium text-gray-400">{{ store.skillTreeProgressPercent }}%</span>
      </div>
    </div>

    <!-- Skill Tree Tab -->
    <div v-show="activeTab === 'skill-tree'" class="tab-content">
      <ClientOnly>
        <div class="size-full">
          <SkillTree ref="skillTreeRef" @node-click="onNodeClick" />
        </div>
      </ClientOnly>
    </div>

    <!-- Monthly Tab -->
    <div v-show="activeTab === 'monthly'" class="tab-content overflow-y-auto p-5">
      <MonthlyChallenges />
    </div>

    <!-- Modal -->
    <ChallengeDetailModal
      v-model:open="detailModalOpen"
      :challenge="selectedChallenge"
    />
  </div>
</template>

<style scoped>
.skill-tree-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f8fafc;
  background-image:
    radial-gradient(circle, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
    radial-gradient(circle, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
  background-size: 40px 40px, 20px 20px;
  background-position: 0 0, 10px 10px;
}

.tab-content {
  flex: 1;
  overflow: hidden;
}
</style>
