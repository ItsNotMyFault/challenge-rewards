<script setup lang="ts">
import type { RedeemType } from '~/types/redeems'
import type { RewardCategory, RewardTemplate } from '~/types/rewards'

const store = useRewardsStore()
const { typeIcon } = useRedeemHelpers()
const { allCategories, categoryIcon } = useRewardHelpers()

store.seedFromPresets()

const formModalOpen = ref(false)
const editingReward = ref<RewardTemplate | null>(null)

function openAdd() {
  editingReward.value = null
  formModalOpen.value = true
}

function openEdit(reward: RewardTemplate) {
  editingReward.value = reward
  formModalOpen.value = true
}

const typeFilterOptions: { label: string, value: RedeemType | null, icon?: string }[] = [
  { label: 'All Types', value: null },
  { label: 'Timed', value: 'timed', icon: 'i-lucide-timer' },
  { label: 'Banked', value: 'banked', icon: 'i-lucide-piggy-bank' },
  { label: 'Instant', value: 'instant', icon: 'i-lucide-zap' },
  { label: 'Counter', value: 'counter', icon: 'i-lucide-hash' },
  { label: 'Toggle', value: 'toggle', icon: 'i-lucide-toggle-left' },
]

const categoryFilterOptions = computed<{ label: string, value: RewardCategory | null, icon?: string }[]>(() => [
  { label: 'All', value: null },
  ...allCategories.map(c => ({ label: c.label, value: c.value, icon: c.icon })),
])
</script>

<template>
  <div class="h-full overflow-y-auto">
    <!-- Page sub-header -->
    <div class="flex items-center justify-between border-b border-[var(--ui-border)] px-4 py-2">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold">Rewards</span>
        <span
          v-if="store.totalCount > 0"
          class="inline-flex items-center rounded-full bg-[var(--ui-primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--ui-primary)]"
        >
          {{ store.totalCount }} total
        </span>
      </div>
      <UButton icon="i-lucide-plus" label="Add Reward" size="sm" @click="openAdd" />
    </div>

    <!-- Gradient backdrop -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[var(--ui-primary)]/5 to-transparent" />

    <div class="relative mx-auto max-w-7xl p-4">
      <!-- Filters -->
      <div class="mb-6 flex flex-wrap items-center gap-3 rounded-xl bg-[var(--ui-bg-elevated)]/50 p-3 ring-1 ring-[var(--ui-border)]">
        <UInput
          v-model="store.searchQuery"
          icon="i-lucide-search"
          placeholder="Search rewards..."
          class="w-64"
          size="sm"
        />

        <USeparator orientation="vertical" class="mx-1 hidden h-6 sm:block" />

        <!-- Category filter -->
        <div class="flex flex-wrap gap-1">
          <UButton
            v-for="opt in categoryFilterOptions"
            :key="String(opt.value)"
            :icon="opt.icon"
            :label="opt.label"
            :color="store.categoryFilter === opt.value ? 'primary' : 'neutral'"
            :variant="store.categoryFilter === opt.value ? 'subtle' : 'ghost'"
            size="xs"
            @click="store.categoryFilter = opt.value"
          />
        </div>

        <USeparator orientation="vertical" class="mx-1 hidden h-6 sm:block" />

        <!-- Type filter -->
        <div class="flex gap-1">
          <UButton
            v-for="opt in typeFilterOptions"
            :key="String(opt.value)"
            :icon="opt.icon"
            :label="opt.label"
            :color="store.typeFilter === opt.value ? 'primary' : 'neutral'"
            :variant="store.typeFilter === opt.value ? 'subtle' : 'ghost'"
            size="xs"
            @click="store.typeFilter = opt.value"
          />
        </div>
      </div>

      <!-- Grid -->
      <TransitionGroup
        v-if="store.filteredRewards.length > 0"
        tag="div"
        name="card"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <RewardsRewardCard
          v-for="reward in store.filteredRewards"
          :key="reward.id"
          :reward="reward"
          @edit="openEdit"
        />
      </TransitionGroup>

      <!-- Empty state -->
      <div
        v-else
        class="mt-16 flex flex-col items-center justify-center text-center"
      >
        <div class="flex size-20 items-center justify-center rounded-full bg-[var(--ui-bg-elevated)]">
          <UIcon name="i-lucide-gift" class="size-10 text-[var(--ui-text-muted)]" />
        </div>
        <h3 class="mt-4 text-lg font-semibold">No rewards found</h3>
        <p class="mt-1 max-w-sm text-sm text-[var(--ui-text-muted)]">
          Create a reward template to get started, or adjust your filters.
        </p>
        <UButton
          class="mt-4"
          icon="i-lucide-plus"
          label="Add Reward"
          @click="openAdd"
        />
      </div>
    </div>

    <RewardsRewardFormModal v-model:open="formModalOpen" :reward="editingReward" />
  </div>
</template>

<style scoped>
.card-enter-active,
.card-leave-active {
  transition: all 0.3s ease;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

.card-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

.card-move {
  transition: transform 0.3s ease;
}
</style>
