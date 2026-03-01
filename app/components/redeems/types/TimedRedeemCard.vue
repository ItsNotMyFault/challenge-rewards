<script setup lang="ts">
import type { TimedRedeem } from '~/types/redeems'

const props = defineProps<{
  redeem: TimedRedeem
  readonly?: boolean
}>()

const actions = useRedeemActions()
const redeemRef = computed(() => props.redeem)
const { formattedElapsed, formattedRemaining, progress, isRunning, remainingMs } = useTimer(redeemRef)

const progressColor = computed(() => {
  if (progress.value >= 90) return 'success'
  return 'primary'
})

watch(remainingMs, (val) => {
  if (val <= 0 && props.redeem.status !== 'completed') {
    actions.completeTimer(props.redeem.id)
  }
})
</script>

<template>
  <div class="space-y-3">
    <!-- Large centered timer -->
    <div class="flex flex-col items-center gap-1 py-2">
      <span
        :class="[
          'font-mono text-2xl font-bold tabular-nums tracking-wider',
          isRunning ? 'text-blue-400' : '',
        ]"
      >
        {{ formattedElapsed }}
      </span>
      <span class="text-xs text-[var(--ui-text-muted)]">elapsed</span>
    </div>

    <StaticProgressBar :value="progress" />

    <div class="flex items-center justify-between text-xs text-[var(--ui-text-muted)]">
      <span>{{ Math.round(progress) }}%</span>
      <span class="font-mono tabular-nums">{{ formattedRemaining }} left</span>
    </div>

    <div v-if="redeem.status !== 'completed' && !readonly" class="flex gap-2">
      <UButton
        v-if="!isRunning"
        icon="i-lucide-play"
        :label="redeem.accumulatedMs > 0 ? 'Resume' : 'Start'"
        color="primary"
        variant="soft"
        size="sm"
        block
        @click="actions.startTimer(redeem.id)"
      />
      <UButton
        v-else
        icon="i-lucide-pause"
        label="Pause"
        color="warning"
        variant="soft"
        size="sm"
        block
        @click="actions.pauseTimer(redeem.id)"
      />
      <UButton
        icon="i-lucide-check"
        label="Complete"
        color="success"
        variant="soft"
        size="sm"
        @click="actions.completeTimer(redeem.id)"
      />
    </div>
  </div>
</template>
