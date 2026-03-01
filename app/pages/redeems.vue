<script setup lang="ts">
import type { RewardCategory } from '~/types/rewards'

const store = useRedeemsStore()
const { categoryColors, allCategories } = useRewardHelpers()

await useAsyncData('redeems', () => store.fetchRedeems())

function toggleCategoryFilter(c: RewardCategory) {
  store.categoryFilter = store.categoryFilter === c ? null : c
}

const statusTabs = [
  { label: 'All', value: 'all' as const },
  { label: 'Active', value: 'active' as const },
  { label: 'Completed', value: 'completed' as const },
]
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div class="relative mx-auto max-w-7xl p-4">
      <!-- Stats (clickable filters) -->
      <RedeemsRedeemStats />

      <!-- Two-column layout -->
      <div class="flex gap-6">
        <!-- Left: filters + grid -->
        <div class="min-w-0 flex-1">
          <!-- Filter bar -->
          <div class="mb-6 space-y-2.5 rounded-xl bg-[var(--ui-bg-elevated)]/50 p-3 ring-1 ring-[var(--ui-border)]">
            <!-- Row 1: category stat badges + status tabs + add button -->
            <div class="flex items-center gap-2">
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="cat in allCategories"
                  :key="cat.value"
                  class="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 ring-1 transition-all"
                  :class="store.categoryFilter === cat.value
                    ? [categoryColors(cat.value).bg, categoryColors(cat.value).ring, 'ring-2']
                    : 'bg-[var(--ui-bg-elevated)]/50 ring-[var(--ui-border)] hover:ring-[var(--ui-primary)]/30'"
                  @click="toggleCategoryFilter(cat.value)"
                >
                  <UIcon :name="cat.icon" :class="['size-3.5', categoryColors(cat.value).text]" />
                  <span class="text-xs font-medium">{{ cat.label }}</span>
                  <UBadge
                    v-if="store.countByCategory[cat.value].completed > 0"
                    :label="`${store.countByCategory[cat.value].completed}/${store.countByCategory[cat.value].total}`"
                    color="success"
                    variant="subtle"
                    size="xs"
                  />
                  <UBadge
                    v-else-if="store.countByCategory[cat.value].total > 0"
                    :label="`0/${store.countByCategory[cat.value].total}`"
                    color="neutral"
                    variant="subtle"
                    size="xs"
                  />
                  <span v-else class="text-xs text-[var(--ui-text-dimmed)]">-</span>
                </button>
              </div>

              <USeparator orientation="vertical" class="mx-1 hidden h-6 sm:block" />

              <div class="flex gap-1">
                <UButton
                  v-for="tab in statusTabs"
                  :key="tab.value"
                  :label="`${tab.label} (${tab.value === 'all' ? store.totalCount : tab.value === 'active' ? store.activeCount : store.completedCount})`"
                  :color="store.statusFilter === tab.value ? 'primary' : 'neutral'"
                  :variant="store.statusFilter === tab.value ? 'subtle' : 'ghost'"
                  size="xs"
                  @click="store.statusFilter = tab.value"
                />
              </div>

              <div class="flex-1" />
            </div>

            <!-- Row 2: search -->
            <UInput
              v-model="store.searchQuery"
              icon="i-lucide-search"
              placeholder="Search redeems..."
              class="w-full"
              size="sm"
            />
          </div>

          <!-- Grid -->
          <TransitionGroup
            v-if="store.filteredRedeems.length > 0"
            tag="div"
            name="card"
            class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            <RedeemsRedeemCard
              v-for="redeem in store.filteredRedeems"
              :key="redeem.id"
              :redeem="redeem"
            />
          </TransitionGroup>

          <!-- Empty state -->
          <div
            v-else
            class="mt-16 flex flex-col items-center justify-center text-center"
          >
            <div class="flex size-20 items-center justify-center rounded-full bg-[var(--ui-bg-elevated)]">
              <UIcon name="i-lucide-inbox" class="size-10 text-[var(--ui-text-muted)]" />
            </div>
            <h3 class="mt-4 text-lg font-semibold">No redeems found</h3>
            <p class="mt-1 max-w-sm text-sm text-[var(--ui-text-muted)]">
              No redeems yet. Join an event as a fundraiser to start tracking redeems.
            </p>
          </div>
        </div>

        <!-- Right: leaderboard (hidden on small screens) -->
        <div class="hidden w-72 shrink-0 lg:block">
          <div class="sticky top-4">
            <RedeemsRedeemLeaderboard />
          </div>
        </div>
      </div>
    </div>

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
