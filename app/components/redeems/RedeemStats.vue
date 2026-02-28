<script setup lang="ts">
const store = useRedeemsStore()

const completionPercent = computed(() => {
  if (store.totalCount === 0) return 0
  return Math.round((store.completedCount / store.totalCount) * 100)
})
</script>

<template>
  <div class="mb-6 space-y-3">
    <!-- Overview stats row -->
    <div class="grid grid-cols-3 gap-3">
      <div class="rounded-xl bg-[var(--ui-bg-elevated)]/50 px-4 py-3 text-center ring-1 ring-[var(--ui-border)]">
        <div class="text-2xl font-bold">{{ store.totalCount }}</div>
        <div class="text-xs text-[var(--ui-text-muted)]">Total</div>
      </div>
      <div class="rounded-xl bg-[var(--ui-bg-elevated)]/50 px-4 py-3 text-center ring-1 ring-[var(--ui-border)]">
        <div class="text-2xl font-bold text-green-500">{{ store.completedCount }}</div>
        <div class="text-xs text-[var(--ui-text-muted)]">Completed</div>
      </div>
      <div class="rounded-xl bg-[var(--ui-bg-elevated)]/50 px-4 py-3 text-center ring-1 ring-[var(--ui-border)]">
        <div class="text-2xl font-bold text-blue-500">{{ store.activeCount }}</div>
        <div class="text-xs text-[var(--ui-text-muted)]">Active</div>
      </div>
    </div>

    <!-- Completion bar -->
    <div v-if="store.totalCount > 0" class="space-y-1">
      <StaticProgressBar :value="completionPercent" color="bg-green-500" size="xs" />
      <div class="text-right text-xs text-[var(--ui-text-muted)]">{{ completionPercent }}% completed</div>
    </div>

  </div>
</template>
