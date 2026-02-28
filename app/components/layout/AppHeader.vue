<script setup lang="ts">
defineEmits<{
  addRedeem: []
}>()

const store = useRedeemsStore()
</script>

<template>
  <div class="flex items-center justify-between border-b border-[var(--ui-border)] px-4 py-2">
    <div class="flex items-center gap-2">
      <span class="text-sm font-semibold">Redeems</span>
      <span
        v-if="store.activeCount > 0"
        class="inline-flex items-center rounded-full bg-[var(--ui-primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--ui-primary)]"
      >
        {{ store.activeCount }} active
      </span>
    </div>
    <UButton icon="i-lucide-plus" label="Add Redeem" size="sm" @click="$emit('addRedeem')" />
  </div>
</template>
