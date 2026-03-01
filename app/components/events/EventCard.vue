<script setup lang="ts">
import type { GameEvent } from '~/types/events'

const props = defineProps<{
  event: GameEvent
}>()

const store = useEventsStore()

const raised = computed(() => store.eventRaised(props.event.id))
const progress = computed(() => {
  if (props.event.goal <= 0) return 0
  return Math.min((raised.value / props.event.goal) * 100, 100)
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
}

const statusColor = computed(() => {
  switch (props.event.status) {
    case 'active': return 'success'
    case 'completed': return 'info'
    case 'draft': return 'neutral'
    default: return 'neutral'
  }
})
</script>

<template>
  <NuxtLink :to="`/events/${event.id}`" class="block">
    <UCard
      variant="outline"
      class="border-l-3 border-[var(--ui-primary)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--ui-primary)]/5"
      :ui="{ root: 'h-full flex flex-col', body: 'flex-1' }"
    >
      <template #header>
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-bold leading-tight">{{ event.name }}</h3>
            <p class="mt-1 line-clamp-2 text-xs text-[var(--ui-text-muted)]">{{ event.description }}</p>
          </div>
          <UBadge :color="statusColor" variant="subtle" size="xs">
            {{ event.status }}
          </UBadge>
        </div>
      </template>

      <div class="space-y-3">
        <div class="space-y-1.5">
          <div class="flex items-end justify-between text-sm">
            <span class="font-bold text-[var(--ui-primary)]">{{ formatCurrency(raised) }}</span>
            <span class="text-xs text-[var(--ui-text-muted)]">of {{ formatCurrency(event.goal) }}</span>
          </div>
          <StaticProgressBar :value="progress" :color="progress >= 100 ? 'bg-green-500' : 'bg-primary'" />
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between text-xs text-[var(--ui-text-muted)]">
          <span class="inline-flex items-center gap-1">
            <UIcon name="i-lucide-users" class="size-3" />
            {{ event.fundraiserCount ?? event.fundraisers.length }} fundraiser{{ (event.fundraiserCount ?? event.fundraisers.length) !== 1 ? 's' : '' }}
          </span>
          <span v-if="event.donationUrl" class="inline-flex items-center gap-1 text-[var(--ui-primary)]">
            <UIcon name="i-lucide-external-link" class="size-3" />
            Donate
          </span>
        </div>
      </template>
    </UCard>
  </NuxtLink>
</template>
