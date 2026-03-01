<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { RewardTemplate } from '~/types/rewards'

const props = defineProps<{
  reward: RewardTemplate
}>()

const emit = defineEmits<{
  edit: [reward: RewardTemplate]
}>()

const store = useRewardsStore()
const confirm = useConfirmAction()
const { typeIcon, typeLabel, typeColors } = useRedeemHelpers()
const { categoryLabel, categoryColors } = useRewardHelpers()

const colors = computed(() => categoryColors(props.reward.category))

const typeDefaultLabel = computed(() => {
  switch (props.reward.type) {
    case 'timed': return `${Math.round(props.reward.requiredMs / 60000)} min`
    case 'banked': return `Qty: ${props.reward.quantity}`
    case 'counter': return `Target: ${props.reward.targetCount}`
    default: return null
  }
})

function confirmDelete() {
  confirm.requestConfirm({
    title: 'Delete Reward',
    message: `Delete "${props.reward.rewardName}"? This cannot be undone.`,
    color: 'error',
    confirmLabel: 'Delete',
    confirmIcon: 'i-lucide-trash-2',
    action: () => store.deleteReward(props.reward.id),
  })
}

const menuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect: () => emit('edit', props.reward),
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      color: 'error' as const,
      onSelect: () => confirmDelete(),
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
          <span
            :class="[
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
              colors.bg,
            ]"
          >
            <UIcon :name="reward.icon" :class="['size-5', colors.text]" />
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-bold leading-tight">{{ reward.rewardName }}</h3>
            <p class="mt-1 line-clamp-2 text-xs text-[var(--ui-text-muted)]">{{ reward.description }}</p>
          </div>
        </div>
        <UDropdownMenu :items="menuItems">
          <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="xs" />
        </UDropdownMenu>
      </div>
    </template>

    <div v-if="typeDefaultLabel" class="mb-3 inline-flex items-center gap-1.5 rounded-md bg-[var(--ui-bg-elevated)]/50 px-2.5 py-1.5 text-xs font-medium">
      <UIcon :name="typeIcon(reward.type)" :class="['size-3.5', typeColors(reward.type).text]" />
      <span>{{ typeDefaultLabel }}</span>
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <UBadge :label="categoryLabel(reward.category)" :color="'neutral'" variant="subtle" size="xs">
          <template #leading>
            <UIcon :name="reward.icon" class="size-3" />
          </template>
        </UBadge>
        <UBadge :label="typeLabel(reward.type)" color="neutral" variant="outline" size="xs">
          <template #leading>
            <UIcon :name="typeIcon(reward.type)" :class="['size-3', typeColors(reward.type).text]" />
          </template>
        </UBadge>
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
