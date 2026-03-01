<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Redeem } from '~/types/redeems'

const props = defineProps<{
  redeem: Redeem
}>()

const actions = useRedeemActions()
const confirm = useConfirmAction()
const { statusColor, typeIcon, typeLabel, typeColors, relativeTime } = useRedeemHelpers()
const { categoryColors, categoryIcon, categoryLabel } = useRewardHelpers()

const colors = computed(() => typeColors(props.redeem.type))
const catColors = computed(() => categoryColors(props.redeem.category))

const initials = computed(() => {
  const name = props.redeem.redeemer
  return name.slice(0, 2).toUpperCase()
})

function confirmReset() {
  confirm.requestConfirm({
    title: 'Reset Redeem',
    message: `Reset "${props.redeem.rewardName}" to its initial state? This cannot be undone.`,
    color: 'warning',
    confirmLabel: 'Reset',
    confirmIcon: 'i-lucide-rotate-ccw',
    action: () => actions.resetRedeem(props.redeem.id),
  })
}

const menuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Reset',
      icon: 'i-lucide-rotate-ccw',
      color: 'warning' as const,
      onSelect: () => confirmReset(),
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      color: 'error' as const,
      onSelect: () => actions.deleteRedeem(props.redeem.id),
    },
  ],
])
</script>

<template>
  <UCard
    variant="outline"
    :class="[
      'border-l-3 transition-all duration-200 hover:shadow-lg hover:shadow-[var(--ui-primary)]/5',
      colors.border,
    ]"
    :ui="{ root: 'h-full flex flex-col', body: 'flex-1' }"
  >
    <template #header>
      <div class="flex items-start justify-between gap-2">
        <div class="flex min-w-0 flex-1 items-start gap-3">
          <!-- Avatar -->
          <span
            :class="[
              'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
              colors.bg,
              colors.text,
            ]"
          >
            {{ initials }}
          </span>

          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-bold leading-tight">{{ redeem.rewardName }}</h3>
            <div class="mt-1 flex items-center gap-1.5 text-xs text-[var(--ui-text-muted)]">
              <span>{{ redeem.redeemer }}</span>
              <span class="text-[var(--ui-text-dimmed)]">&middot;</span>
              <UBadge :color="statusColor(redeem.status)" variant="subtle" size="xs">
                {{ redeem.status }}
              </UBadge>
            </div>
          </div>
        </div>
        <UDropdownMenu :items="menuItems">
          <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="xs" />
        </UDropdownMenu>
      </div>
    </template>

    <div v-if="redeem.note" class="mb-3 rounded-md bg-[var(--ui-bg-elevated)]/50 px-2.5 py-1.5 text-xs text-[var(--ui-text-muted)] italic">
      {{ redeem.note }}
    </div>

    <RedeemsTypesTimedRedeemCard v-if="redeem.type === 'timed'" :redeem="redeem" />
    <RedeemsTypesBankedRedeemCard v-else-if="redeem.type === 'banked'" :redeem="redeem" />
    <RedeemsTypesInstantRedeemCard v-else-if="redeem.type === 'instant'" :redeem="redeem" />
    <RedeemsTypesCounterRedeemCard v-else-if="redeem.type === 'counter'" :redeem="redeem" />
    <RedeemsTypesToggleRedeemCard v-else-if="redeem.type === 'toggle'" :redeem="redeem" />

    <template #footer>
      <div class="flex items-center justify-between text-xs text-[var(--ui-text-muted)]">
        <span>{{ relativeTime(redeem.createdAt) }}</span>
        <div class="flex items-center gap-2">
          <span :class="['inline-flex items-center gap-1 rounded-md px-1.5 py-0.5', catColors.bg]">
            <UIcon :name="categoryIcon(redeem.category)" :class="['size-3', catColors.text]" />
            <span :class="catColors.text">{{ categoryLabel(redeem.category) }}</span>
          </span>
          <span class="inline-flex items-center gap-1">
            <UIcon :name="typeIcon(redeem.type)" :class="['size-3', colors.text]" />
            <span :class="colors.text">{{ typeLabel(redeem.type) }}</span>
          </span>
        </div>
      </div>
    </template>
  </UCard>

  <ConfirmModal
    v-model:open="confirm.isOpen.value"
    :title="confirm.title.value"
    :message="confirm.message.value"
    :color="confirm.color.value"
    :confirm-label="confirm.confirmLabel.value"
    :confirm-icon="confirm.confirmIcon.value"
    @confirm="confirm.onConfirm"
    @cancel="confirm.onCancel"
  />
</template>
