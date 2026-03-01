<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: number
  color?: string
  size?: 'xs' | 'sm' | 'md'
}>(), {
  color: 'bg-green-500',
  size: 'sm',
})

const clamped = computed(() => Math.max(0, Math.min(100, props.value)))

const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'h-1'
    case 'sm': return 'h-1.5'
    case 'md': return 'h-2'
  }
})
</script>

<template>
  <div :class="['w-full overflow-hidden rounded-full bg-accented', sizeClass]">
    <div
      :class="['h-full rounded-full', color]"
      :style="{ width: `${clamped}%` }"
    />
  </div>
</template>
