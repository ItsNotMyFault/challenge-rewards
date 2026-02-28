<script setup lang="ts">
import type { CounterRedeem } from '~/types/redeems'

const props = defineProps<{
  redeem: CounterRedeem
}>()

const store = useRedeemsStore()

const progress = computed(() => {
  if (props.redeem.targetCount === 0) return 100
  return (props.redeem.currentCount / props.redeem.targetCount) * 100
})
</script>

<template>
  <div class="space-y-3">
    <!-- Large count display -->
    <div class="flex flex-col items-center gap-1 py-2">
      <div class="flex items-baseline gap-1">
        <span class="text-3xl font-bold text-violet-500">{{ redeem.currentCount }}</span>
        <span class="text-lg text-[var(--ui-text-muted)]">/</span>
        <span class="text-lg text-[var(--ui-text-muted)]">{{ redeem.targetCount }}</span>
      </div>
    </div>

    <div class="space-y-1">
      <StaticProgressBar :value="progress" />
      <div class="text-right text-xs text-[var(--ui-text-muted)]">{{ Math.round(progress) }}%</div>
    </div>

    <div v-if="redeem.status !== 'completed'" class="flex gap-1">
      <UButton
        icon="i-lucide-minus"
        color="neutral"
        variant="soft"
        size="sm"
        :disabled="redeem.currentCount <= 0"
        @click="store.decrementCounter(redeem.id)"
      />
      <UButton
        icon="i-lucide-plus"
        label="+1"
        color="primary"
        variant="soft"
        size="sm"
        block
        @click="store.incrementCounter(redeem.id)"
      />
    </div>
  </div>
</template>
