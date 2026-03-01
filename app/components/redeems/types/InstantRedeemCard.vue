<script setup lang="ts">
import type { InstantRedeem } from '~/types/redeems'

const props = defineProps<{
  redeem: InstantRedeem
}>()

const actions = useRedeemActions()
const { relativeTime } = useRedeemHelpers()
</script>

<template>
  <div class="space-y-3">
    <!-- Completed state -->
    <div
      v-if="redeem.status === 'completed' && redeem.completedAt"
      class="flex flex-col items-center gap-2 py-3"
    >
      <div class="flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
        <UIcon name="i-lucide-check-circle-2" class="size-7 text-emerald-500" />
      </div>
      <span class="text-sm font-medium text-emerald-500">Completed</span>
      <span class="text-xs text-[var(--ui-text-muted)]">
        {{ relativeTime(redeem.completedAt) }}
      </span>
    </div>

    <!-- Active state - prominent CTA -->
    <div v-else class="flex flex-col items-center py-3">
      <UButton
        icon="i-lucide-zap"
        label="Mark Complete"
        color="success"
        size="lg"
        block
        @click="actions.completeInstant(redeem.id)"
      />
    </div>
  </div>
</template>
