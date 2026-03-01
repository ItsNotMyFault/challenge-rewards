<script setup lang="ts">
import type { ToggleRedeem } from '~/types/redeems'

const props = defineProps<{
  redeem: ToggleRedeem
  readonly?: boolean
}>()

const actions = useRedeemActions()
const { relativeTime, formatDuration } = useRedeemHelpers()

const isActive = computed(() => props.redeem.status === 'active' && props.redeem.activatedAt !== null)

const activeDuration = ref('')
let durationInterval: ReturnType<typeof setInterval> | null = null

function updateDuration() {
  if (isActive.value && props.redeem.activatedAt) {
    const ms = Date.now() - new Date(props.redeem.activatedAt).getTime()
    activeDuration.value = formatDuration(ms)
  }
}

watch(isActive, (active) => {
  if (active) {
    updateDuration()
    durationInterval = setInterval(updateDuration, 1000)
  } else if (durationInterval) {
    clearInterval(durationInterval)
    durationInterval = null
  }
}, { immediate: true })

onUnmounted(() => {
  if (durationInterval) clearInterval(durationInterval)
})

function toggle(value: boolean) {
  if (value) {
    actions.activateToggle(props.redeem.id)
  }
  else {
    actions.deactivateToggle(props.redeem.id)
  }
}
</script>

<template>
  <div class="space-y-3">
    <!-- Centered switch with glow -->
    <div
      :class="[
        'flex flex-col items-center gap-3 rounded-lg px-4 py-4 transition-colors duration-300',
        isActive ? 'bg-cyan-500/10' : '',
      ]"
    >
      <div class="flex items-center gap-3">
        <span
          :class="[
            'text-sm font-semibold transition-colors',
            isActive ? 'text-cyan-500' : 'text-[var(--ui-text-muted)]',
          ]"
        >
          {{ isActive ? 'Active' : 'Inactive' }}
        </span>
        <USwitch
          :model-value="isActive"
          :disabled="redeem.status === 'completed' || readonly"
          @update:model-value="toggle"
        />
      </div>

      <!-- Active duration -->
      <div v-if="isActive && activeDuration" class="text-xs font-mono text-cyan-400">
        Active for {{ activeDuration }}
      </div>
    </div>

    <div class="space-y-1 text-xs text-[var(--ui-text-muted)]">
      <div v-if="redeem.activatedAt" class="flex items-center gap-1.5">
        <UIcon name="i-lucide-play-circle" class="size-3" />
        <span>Activated {{ relativeTime(redeem.activatedAt) }}</span>
      </div>
      <div v-if="redeem.deactivatedAt" class="flex items-center gap-1.5">
        <UIcon name="i-lucide-stop-circle" class="size-3" />
        <span>Deactivated {{ relativeTime(redeem.deactivatedAt) }}</span>
      </div>
    </div>

  </div>
</template>
