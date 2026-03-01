<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import type { RewardCategory, RewardTemplate } from '~/types/rewards'

const open = defineModel<boolean>('open', { default: false })

const rewardsStore = useRewardsStore()
const redeemsStore = useRedeemsStore()
const toast = useToast()
const { typeIcon, typeLabel, typeColors } = useRedeemHelpers()
const { allCategories, categoryColors, categoryLabel } = useRewardHelpers()

const step = ref<1 | 2>(1)
const selectedReward = ref<RewardTemplate | null>(null)
const searchQuery = ref('')
const categoryFilter = ref<RewardCategory | null>(null)

const filteredRewards = computed(() => {
  let result = rewardsStore.rewards

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      r =>
        r.rewardName.toLowerCase().includes(q)
        || r.description.toLowerCase().includes(q),
    )
  }

  if (categoryFilter.value) {
    result = result.filter(r => r.category === categoryFilter.value)
  }

  return result.slice().sort((a, b) => a.rewardName.localeCompare(b.rewardName))
})

const state = reactive({
  redeemer: '',
  note: '',
  requiredMinutes: 30,
  quantity: 1,
  targetCount: 10,
})

function selectReward(reward: RewardTemplate) {
  selectedReward.value = reward
  if (reward.type === 'timed') state.requiredMinutes = Math.round(reward.requiredMs / 60000)
  if (reward.type === 'banked') state.quantity = reward.quantity
  if (reward.type === 'counter') state.targetCount = reward.targetCount
  step.value = 2
}

function goBack() {
  step.value = 1
  selectedReward.value = null
}

function validate(): FormError[] {
  const errors: FormError[] = []
  if (!state.redeemer.trim()) errors.push({ name: 'redeemer', message: 'Required' })
  if (selectedReward.value?.type === 'timed' && state.requiredMinutes <= 0) {
    errors.push({ name: 'requiredMinutes', message: 'Must be greater than 0' })
  }
  if (selectedReward.value?.type === 'banked' && state.quantity <= 0) {
    errors.push({ name: 'quantity', message: 'Must be greater than 0' })
  }
  if (selectedReward.value?.type === 'counter' && state.targetCount <= 0) {
    errors.push({ name: 'targetCount', message: 'Must be greater than 0' })
  }
  return errors
}

function onSubmit() {
  const reward = selectedReward.value
  if (!reward) return

  const base = {
    redeemer: state.redeemer.trim(),
    rewardName: reward.rewardName,
    category: reward.category,
    note: state.note.trim(),
  }

  switch (reward.type) {
    case 'timed':
      redeemsStore.addRedeem({ ...base, type: 'timed', requiredMs: state.requiredMinutes * 60 * 1000 })
      break
    case 'banked':
      redeemsStore.addRedeem({ ...base, type: 'banked', quantity: state.quantity })
      break
    case 'instant':
      redeemsStore.addRedeem({ ...base, type: 'instant' })
      break
    case 'counter':
      redeemsStore.addRedeem({ ...base, type: 'counter', targetCount: state.targetCount })
      break
    case 'toggle':
      redeemsStore.addRedeem({ ...base, type: 'toggle' })
      break
  }

  toast.add({ title: 'Redeem added', color: 'success' })
  resetAndClose()
}

function resetAndClose() {
  step.value = 1
  selectedReward.value = null
  searchQuery.value = ''
  categoryFilter.value = null
  state.redeemer = ''
  state.note = ''
  state.requiredMinutes = 30
  state.quantity = 1
  state.targetCount = 10
  open.value = false
}

const typeDefaultLabel = computed(() => {
  const r = selectedReward.value
  if (!r) return null
  switch (r.type) {
    case 'timed': return `${Math.round(r.requiredMs / 60000)} min`
    case 'banked': return `Qty: ${r.quantity}`
    case 'counter': return `Target: ${r.targetCount}`
    default: return null
  }
})
</script>

<template>
  <UModal v-model:open="open" :title="step === 1 ? 'Select a Reward' : 'Add Redeem'" :ui="{ footer: 'justify-end' }">
    <template #body>
      <!-- Step 1: Browse catalog -->
      <div v-if="step === 1" class="space-y-4">
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Search rewards..."
          class="w-full"
          size="sm"
        />

        <!-- Category pills -->
        <div class="flex flex-wrap gap-1">
          <UButton
            label="All"
            :color="categoryFilter === null ? 'primary' : 'neutral'"
            :variant="categoryFilter === null ? 'subtle' : 'ghost'"
            size="xs"
            @click="categoryFilter = null"
          />
          <UButton
            v-for="cat in allCategories"
            :key="cat.value"
            :icon="cat.icon"
            :label="cat.label"
            :color="categoryFilter === cat.value ? 'primary' : 'neutral'"
            :variant="categoryFilter === cat.value ? 'subtle' : 'ghost'"
            size="xs"
            @click="categoryFilter = cat.value"
          />
        </div>

        <!-- Reward list -->
        <div v-if="filteredRewards.length > 0" class="max-h-80 space-y-2 overflow-y-auto">
          <button
            v-for="reward in filteredRewards"
            :key="reward.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-lg border border-[var(--ui-border)] px-3 py-2.5 text-left transition-all hover:bg-[var(--ui-bg-elevated)]/50 hover:ring-1 hover:ring-[var(--ui-primary)]/30"
            @click="selectReward(reward)"
          >
            <span
              :class="[
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                categoryColors(reward.category).bg,
              ]"
            >
              <UIcon :name="reward.icon" :class="['size-4', categoryColors(reward.category).text]" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-medium">{{ reward.rewardName }}</div>
              <div class="truncate text-xs text-[var(--ui-text-muted)]">{{ reward.description }}</div>
            </div>
            <div class="flex shrink-0 items-center gap-1.5">
              <UBadge :label="typeLabel(reward.type)" color="neutral" variant="outline" size="xs">
                <template #leading>
                  <UIcon :name="typeIcon(reward.type)" :class="['size-3', typeColors(reward.type).text]" />
                </template>
              </UBadge>
            </div>
          </button>
        </div>

        <div v-else class="py-8 text-center">
          <UIcon name="i-lucide-gift" class="mx-auto size-8 text-[var(--ui-text-muted)]" />
          <p class="mt-2 text-sm text-[var(--ui-text-muted)]">No rewards found. Create some on the Rewards page first.</p>
        </div>
      </div>

      <!-- Step 2: Configure & submit -->
      <div v-else-if="step === 2 && selectedReward" class="space-y-5">
        <!-- Selected reward summary -->
        <div class="flex items-center gap-3 rounded-lg bg-[var(--ui-bg-elevated)]/50 p-3 ring-1 ring-[var(--ui-border)]">
          <span
            :class="[
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
              categoryColors(selectedReward.category).bg,
            ]"
          >
            <UIcon :name="selectedReward.icon" :class="['size-5', categoryColors(selectedReward.category).text]" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="font-medium">{{ selectedReward.rewardName }}</div>
            <div class="text-xs text-[var(--ui-text-muted)]">{{ selectedReward.description }}</div>
            <div class="mt-1 flex items-center gap-2">
              <UBadge :label="typeLabel(selectedReward.type)" color="neutral" variant="outline" size="xs">
                <template #leading>
                  <UIcon :name="typeIcon(selectedReward.type)" :class="['size-3', typeColors(selectedReward.type).text]" />
                </template>
              </UBadge>
              <UBadge :label="categoryLabel(selectedReward.category)" color="neutral" variant="subtle" size="xs" />
              <span v-if="typeDefaultLabel" class="text-xs text-[var(--ui-text-muted)]">{{ typeDefaultLabel }}</span>
            </div>
          </div>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" @click="goBack" />
        </div>

        <UForm :validate="validate" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Redeemer" name="redeemer">
            <UInputMenu
              v-model="state.redeemer"
              :items="redeemsStore.recentRedeemers"
              placeholder="Username"
              :create-item="{ position: 'top', when: 'always' }"
              class="w-full"
            />
          </UFormField>

          <!-- Type-specific override -->
          <Transition name="field" mode="out-in">
            <UFormField
              v-if="selectedReward.type === 'timed'"
              key="timed"
              label="Duration (minutes)"
              name="requiredMinutes"
            >
              <UInput v-model.number="state.requiredMinutes" type="number" :min="1" class="w-full" />
            </UFormField>

            <UFormField
              v-else-if="selectedReward.type === 'banked'"
              key="banked"
              label="Quantity"
              name="quantity"
            >
              <UInput v-model.number="state.quantity" type="number" :min="1" class="w-full" />
            </UFormField>

            <UFormField
              v-else-if="selectedReward.type === 'counter'"
              key="counter"
              label="Target Count"
              name="targetCount"
            >
              <UInput v-model.number="state.targetCount" type="number" :min="1" class="w-full" />
            </UFormField>

            <div v-else key="none" />
          </Transition>

          <UFormField label="Note (optional)" name="note">
            <UTextarea v-model="state.note" placeholder="Any additional details..." class="w-full" />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton label="Back" color="neutral" variant="outline" icon="i-lucide-arrow-left" @click="goBack" />
            <UButton type="submit" label="Add Redeem" />
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.field-enter-active,
.field-leave-active {
  transition: all 0.2s ease;
}

.field-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.field-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
