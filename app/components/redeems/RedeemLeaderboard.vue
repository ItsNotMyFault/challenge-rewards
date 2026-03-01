<script setup lang="ts">
import type { Redeem } from '~/types/redeems'

const props = withDefaults(defineProps<{
  redeems?: Redeem[]
  title?: string
}>(), {
  title: 'Leaderboard',
})

const store = useRedeemsStore()

const leaderboard = computed(() => {
  const source = props.redeems ?? store.redeems
  const map = new Map<string, { redeemer: string, total: number, completed: number, active: number }>()
  for (const r of source) {
    const key = r.redeemer.toLowerCase()
    const entry = map.get(key) || { redeemer: r.redeemer, total: 0, completed: 0, active: 0 }
    entry.total++
    if (r.status === 'completed') entry.completed++
    else entry.active++
    map.set(key, entry)
  }
  return [...map.values()].sort((a, b) => b.total - a.total || a.redeemer.localeCompare(b.redeemer))
})

const rankColors = ['text-amber-400', 'text-zinc-400', 'text-orange-400']
const rankIcons = ['i-lucide-crown', 'i-lucide-medal', 'i-lucide-award']

function initials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

function completionPercent(entry: { total: number, completed: number }) {
  if (entry.total === 0) return 0
  return Math.round((entry.completed / entry.total) * 100)
}
</script>

<template>
  <div class="rounded-xl bg-[var(--ui-bg-elevated)]/50 p-4 ring-1 ring-[var(--ui-border)]">
    <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold">
      <UIcon name="i-lucide-trophy" class="size-4 text-amber-400" />
      {{ title }}
    </h3>

    <div v-if="leaderboard.length > 0" class="space-y-2">
      <div
        v-for="(entry, idx) in leaderboard"
        :key="entry.redeemer"
        class="flex items-center gap-2.5 rounded-lg px-2 py-1.5"
        :class="idx < 3 ? 'bg-[var(--ui-bg-elevated)]/50' : ''"
      >
        <!-- Rank -->
        <div class="flex w-5 shrink-0 items-center justify-center">
          <UIcon
            v-if="idx < 3"
            :name="rankIcons[idx]"
            :class="['size-4', rankColors[idx]]"
          />
          <span v-else class="text-xs text-[var(--ui-text-dimmed)]">{{ idx + 1 }}</span>
        </div>

        <!-- Avatar -->
        <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--ui-primary)]/10 text-xs font-bold text-[var(--ui-primary)]">
          {{ initials(entry.redeemer) }}
        </span>

        <!-- Name + progress -->
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium">{{ entry.redeemer }}</div>
          <StaticProgressBar :value="completionPercent(entry)" color="bg-green-500" size="xs" />
        </div>

        <!-- Count -->
        <div class="shrink-0 text-right">
          <span class="text-sm font-bold">{{ entry.total }}</span>
          <div class="text-xs text-[var(--ui-text-muted)]">
            {{ entry.completed }}/{{ entry.total }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-4 text-center text-xs text-[var(--ui-text-muted)]">
      No redeems yet
    </div>
  </div>
</template>
