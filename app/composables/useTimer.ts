import type { TimedRedeem } from '~/types/redeems'

export function useTimer(redeem: Ref<TimedRedeem> | ComputedRef<TimedRedeem>) {
  const now = ref(Date.now())
  let interval: ReturnType<typeof setInterval> | null = null

  const isRunning = computed(() => redeem.value.timerStartedAt !== null)

  const elapsedMs = computed(() => {
    const base = redeem.value.accumulatedMs
    if (!redeem.value.timerStartedAt) return base
    return base + (now.value - new Date(redeem.value.timerStartedAt).getTime())
  })

  const remainingMs = computed(() => Math.max(0, redeem.value.requiredMs - elapsedMs.value))

  const progress = computed(() => {
    if (redeem.value.requiredMs === 0) return 100
    return Math.min(100, (elapsedMs.value / redeem.value.requiredMs) * 100)
  })

  function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  const formattedElapsed = computed(() => formatDuration(elapsedMs.value))
  const formattedRemaining = computed(() => formatDuration(remainingMs.value))

  function startTicking() {
    if (interval) return
    interval = setInterval(() => {
      now.value = Date.now()
    }, 100)
  }

  function stopTicking() {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  watch(isRunning, (running) => {
    if (running) startTicking()
    else stopTicking()
  }, { immediate: true })

  onUnmounted(() => {
    stopTicking()
  })

  return {
    elapsedMs,
    remainingMs,
    progress,
    formattedElapsed,
    formattedRemaining,
    isRunning,
  }
}
