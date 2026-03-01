<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import type { RewardCategory } from '~/types/rewards'
import presetData from '~/data/redeem-presets.json'

const props = defineProps<{
  eventId: string
  fundraiserId: string
  catalogIds: string[]
}>()

const open = defineModel<boolean>('open', { default: false })
const eventsStore = useEventsStore()
const toast = useToast()
const { typeIcon, typeLabel, typeColors } = useRedeemHelpers()
const { allCategories, categoryColors, categoryLabel } = useRewardHelpers()

const step = ref<1 | 2>(1)
const selectedPreset = ref<typeof presetData.presets[0] | null>(null)
const searchQuery = ref('')
const categoryFilter = ref<RewardCategory | null>(null)

const catalogPresets = computed(() => {
  return presetData.presets.filter(p => props.catalogIds.includes(p.id))
})

const filteredPresets = computed(() => {
  let result = catalogPresets.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => p.rewardName.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  }

  if (categoryFilter.value) {
    result = result.filter(p => p.category === categoryFilter.value)
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

function selectPreset(preset: typeof presetData.presets[0]) {
  selectedPreset.value = preset
  if (preset.type === 'timed' && 'requiredMs' in preset) state.requiredMinutes = Math.round(preset.requiredMs / 60000)
  if (preset.type === 'banked' && 'quantity' in preset) state.quantity = preset.quantity
  if (preset.type === 'counter' && 'targetCount' in preset) state.targetCount = preset.targetCount
  step.value = 2
}

function goBack() {
  step.value = 1
  selectedPreset.value = null
}

function validate(): FormError[] {
  const errors: FormError[] = []
  if (!state.redeemer.trim()) errors.push({ name: 'redeemer', message: 'Required' })
  if (selectedPreset.value?.type === 'timed' && state.requiredMinutes <= 0) {
    errors.push({ name: 'requiredMinutes', message: 'Must be greater than 0' })
  }
  if (selectedPreset.value?.type === 'banked' && state.quantity <= 0) {
    errors.push({ name: 'quantity', message: 'Must be greater than 0' })
  }
  if (selectedPreset.value?.type === 'counter' && state.targetCount <= 0) {
    errors.push({ name: 'targetCount', message: 'Must be greater than 0' })
  }
  return errors
}

function onSubmit() {
  const preset = selectedPreset.value
  if (!preset) return

  const base = {
    redeemer: state.redeemer.trim(),
    rewardName: preset.rewardName,
    category: preset.category as RewardCategory,
    note: state.note.trim(),
  }

  switch (preset.type) {
    case 'timed':
      eventsStore.addFundraiserRedeem(props.eventId, props.fundraiserId, { ...base, type: 'timed', requiredMs: state.requiredMinutes * 60 * 1000 })
      break
    case 'banked':
      eventsStore.addFundraiserRedeem(props.eventId, props.fundraiserId, { ...base, type: 'banked', quantity: state.quantity })
      break
    case 'instant':
      eventsStore.addFundraiserRedeem(props.eventId, props.fundraiserId, { ...base, type: 'instant' })
      break
    case 'counter':
      eventsStore.addFundraiserRedeem(props.eventId, props.fundraiserId, { ...base, type: 'counter', targetCount: state.targetCount })
      break
    case 'toggle':
      eventsStore.addFundraiserRedeem(props.eventId, props.fundraiserId, { ...base, type: 'toggle' })
      break
  }

  toast.add({ title: 'Redeem added', color: 'success' })
  resetAndClose()
}

function resetAndClose() {
  step.value = 1
  selectedPreset.value = null
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
  const p = selectedPreset.value
  if (!p) return null
  switch (p.type) {
    case 'timed': return 'requiredMs' in p ? `${Math.round(p.requiredMs / 60000)} min` : null
    case 'banked': return 'quantity' in p ? `Qty: ${p.quantity}` : null
    case 'counter': return 'targetCount' in p ? `Target: ${p.targetCount}` : null
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

        <div v-if="filteredPresets.length > 0" class="max-h-80 space-y-2 overflow-y-auto">
          <button
            v-for="preset in filteredPresets"
            :key="preset.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-lg border border-[var(--ui-border)] px-3 py-2.5 text-left transition-all hover:bg-[var(--ui-bg-elevated)]/50 hover:ring-1 hover:ring-[var(--ui-primary)]/30"
            @click="selectPreset(preset)"
          >
            <span
              :class="[
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                categoryColors(preset.category as any).bg,
              ]"
            >
              <UIcon :name="preset.icon" :class="['size-4', categoryColors(preset.category as any).text]" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-medium">{{ preset.rewardName }}</div>
              <div class="truncate text-xs text-[var(--ui-text-muted)]">{{ preset.description }}</div>
            </div>
            <UBadge :label="typeLabel(preset.type as any)" color="neutral" variant="outline" size="xs">
              <template #leading>
                <UIcon :name="typeIcon(preset.type as any)" :class="['size-3', typeColors(preset.type as any).text]" />
              </template>
            </UBadge>
          </button>
        </div>

        <div v-else class="py-8 text-center">
          <UIcon name="i-lucide-gift" class="mx-auto size-8 text-[var(--ui-text-muted)]" />
          <p class="mt-2 text-sm text-[var(--ui-text-muted)]">No rewards in this fundraiser's catalog.</p>
        </div>
      </div>

      <!-- Step 2: Configure & submit -->
      <div v-else-if="step === 2 && selectedPreset" class="space-y-5">
        <div class="flex items-center gap-3 rounded-lg bg-[var(--ui-bg-elevated)]/50 p-3 ring-1 ring-[var(--ui-border)]">
          <span
            :class="[
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
              categoryColors(selectedPreset.category as any).bg,
            ]"
          >
            <UIcon :name="selectedPreset.icon" :class="['size-5', categoryColors(selectedPreset.category as any).text]" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="font-medium">{{ selectedPreset.rewardName }}</div>
            <div class="text-xs text-[var(--ui-text-muted)]">{{ selectedPreset.description }}</div>
            <div class="mt-1 flex items-center gap-2">
              <UBadge :label="typeLabel(selectedPreset.type as any)" color="neutral" variant="outline" size="xs">
                <template #leading>
                  <UIcon :name="typeIcon(selectedPreset.type as any)" :class="['size-3', typeColors(selectedPreset.type as any).text]" />
                </template>
              </UBadge>
              <UBadge :label="categoryLabel(selectedPreset.category as any)" color="neutral" variant="subtle" size="xs" />
              <span v-if="typeDefaultLabel" class="text-xs text-[var(--ui-text-muted)]">{{ typeDefaultLabel }}</span>
            </div>
          </div>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" @click="goBack" />
        </div>

        <UForm :validate="validate" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Redeemer" name="redeemer">
            <UInput v-model="state.redeemer" placeholder="Username" class="w-full" />
          </UFormField>

          <Transition name="field" mode="out-in">
            <UFormField
              v-if="selectedPreset.type === 'timed'"
              key="timed"
              label="Duration (minutes)"
              name="requiredMinutes"
            >
              <UInput v-model.number="state.requiredMinutes" type="number" :min="1" class="w-full" />
            </UFormField>

            <UFormField
              v-else-if="selectedPreset.type === 'banked'"
              key="banked"
              label="Quantity"
              name="quantity"
            >
              <UInput v-model.number="state.quantity" type="number" :min="1" class="w-full" />
            </UFormField>

            <UFormField
              v-else-if="selectedPreset.type === 'counter'"
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
