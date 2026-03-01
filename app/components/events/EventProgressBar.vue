<script setup lang="ts">
const props = defineProps<{
  raised: number
  goal: number
}>()

const progress = computed(() => {
  if (props.goal <= 0) return 0
  return Math.min((props.raised / props.goal) * 100, 100)
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-end justify-between">
      <div>
        <span class="text-2xl font-bold text-green-600">{{ formatCurrency(raised) }}</span>
        <span class="ml-1 text-sm text-[var(--ui-text-muted)]">raised of {{ formatCurrency(goal) }}</span>
      </div>
      <span class="text-sm font-medium">{{ Math.round(progress) }}%</span>
    </div>
    <StaticProgressBar :value="progress" class="h-3" />
  </div>
</template>
