<script setup lang="ts">
import type { BankedRedeem } from '~/types/redeems'

defineProps<{
  redeem: BankedRedeem
  readonly?: boolean
}>()

const actions = useRedeemActions()
</script>

<template>
  <div class="space-y-3">
    <!-- Circular quantity display -->
    <div class="flex flex-col items-center gap-1 py-2">
      <div class="flex size-16 items-center justify-center rounded-full border-3 border-amber-500/40 bg-amber-500/10">
        <span class="text-2xl font-bold text-amber-500">{{ redeem.quantity }}</span>
      </div>
      <span class="text-xs text-[var(--ui-text-muted)]">remaining</span>
    </div>

    <!-- Mini stat cards -->
    <div class="grid grid-cols-2 gap-2">
      <div class="rounded-lg bg-[var(--ui-bg-elevated)]/60 px-3 py-2 text-center">
        <div class="text-lg font-bold">{{ redeem.totalRedeemed }}</div>
        <div class="text-xs text-[var(--ui-text-muted)]">Redeemed</div>
      </div>
      <div class="rounded-lg bg-[var(--ui-bg-elevated)]/60 px-3 py-2 text-center">
        <div class="text-lg font-bold">{{ redeem.totalConsumed }}</div>
        <div class="text-xs text-[var(--ui-text-muted)]">Consumed</div>
      </div>
    </div>

    <div v-if="redeem.status !== 'completed' && !readonly" class="flex gap-2">
      <UButton
        icon="i-lucide-minus"
        label="Consume"
        color="primary"
        variant="soft"
        size="sm"
        block
        :disabled="redeem.quantity <= 0"
        @click="actions.consumeBanked(redeem.id)"
      />
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        variant="soft"
        size="sm"
        @click="actions.addToBanked(redeem.id)"
      />
    </div>
  </div>
</template>
