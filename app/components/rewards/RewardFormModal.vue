<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import type { RedeemType } from '~/types/redeems'
import type { RewardCategory, RewardTemplate } from '~/types/rewards'

const props = defineProps<{
  reward?: RewardTemplate | null
}>()

const open = defineModel<boolean>('open', { default: false })

const store = useRewardsStore()
const toast = useToast()
const { typeIcon, typeColors } = useRedeemHelpers()
const { allCategories, categoryColors } = useRewardHelpers()

const typeOptions: { label: string, value: RedeemType, description: string }[] = [
  { label: 'Instant', value: 'instant', description: 'One-click completion' },
  { label: 'Timed', value: 'timed', description: 'Accumulate time' },
  { label: 'Banked', value: 'banked', description: 'Manage quantity' },
  { label: 'Counter', value: 'counter', description: 'Count to a target' },
  { label: 'Toggle', value: 'toggle', description: 'On/off switch' },
]

const state = reactive({
  rewardName: '',
  type: 'instant' as RedeemType,
  description: '',
  icon: 'i-lucide-star',
  category: 'challenge' as RewardCategory,
  requiredMinutes: 30,
  quantity: 1,
  targetCount: 10,
})

const isEditing = computed(() => !!props.reward)

watch(() => props.reward, (val) => {
  if (val) {
    state.rewardName = val.rewardName
    state.type = val.type
    state.description = val.description
    state.icon = val.icon
    state.category = val.category
    if (val.type === 'timed') state.requiredMinutes = Math.round(val.requiredMs / 60000)
    if (val.type === 'banked') state.quantity = val.quantity
    if (val.type === 'counter') state.targetCount = val.targetCount
  }
  else {
    resetForm()
  }
}, { immediate: true })

function validate(): FormError[] {
  const errors: FormError[] = []
  if (!state.rewardName.trim()) errors.push({ name: 'rewardName', message: 'Required' })
  if (!state.icon.trim()) errors.push({ name: 'icon', message: 'Required' })
  if (state.type === 'timed' && state.requiredMinutes <= 0) {
    errors.push({ name: 'requiredMinutes', message: 'Must be greater than 0' })
  }
  if (state.type === 'banked' && state.quantity <= 0) {
    errors.push({ name: 'quantity', message: 'Must be greater than 0' })
  }
  if (state.type === 'counter' && state.targetCount <= 0) {
    errors.push({ name: 'targetCount', message: 'Must be greater than 0' })
  }
  return errors
}

function buildPayload() {
  const base = {
    rewardName: state.rewardName.trim(),
    description: state.description.trim(),
    icon: state.icon.trim(),
    category: state.category,
  }

  switch (state.type) {
    case 'timed':
      return { ...base, type: 'timed' as const, requiredMs: state.requiredMinutes * 60 * 1000 }
    case 'banked':
      return { ...base, type: 'banked' as const, quantity: state.quantity }
    case 'counter':
      return { ...base, type: 'counter' as const, targetCount: state.targetCount }
    case 'instant':
      return { ...base, type: 'instant' as const }
    case 'toggle':
      return { ...base, type: 'toggle' as const }
  }
}

function onSubmit() {
  const payload = buildPayload()

  if (isEditing.value && props.reward) {
    store.updateReward(props.reward.id, payload)
    toast.add({ title: 'Reward updated', color: 'success' })
  }
  else {
    store.addReward(payload)
    toast.add({ title: 'Reward created', color: 'success' })
  }

  open.value = false
  if (!isEditing.value) resetForm()
}

function resetForm() {
  state.rewardName = ''
  state.type = 'instant'
  state.description = ''
  state.icon = 'i-lucide-star'
  state.category = 'challenge'
  state.requiredMinutes = 30
  state.quantity = 1
  state.targetCount = 10
}
</script>

<template>
  <UModal v-model:open="open" :title="isEditing ? 'Edit Reward' : 'Add Reward'" :ui="{ footer: 'justify-end' }">
    <template #body>
      <UForm :validate="validate" :state="state" class="space-y-5" @submit="onSubmit">
        <UFormField label="Reward Name" name="rewardName">
          <UInput v-model="state.rewardName" placeholder="e.g. Wear a Silly Hat" class="w-full" />
        </UFormField>

        <!-- Type selector -->
        <UFormField label="Type" name="type">
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="opt in typeOptions"
              :key="opt.value"
              type="button"
              :class="[
                'flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition-all duration-150',
                state.type === opt.value
                  ? [typeColors(opt.value).border, typeColors(opt.value).bg, 'ring-1', typeColors(opt.value).ring]
                  : 'border-[var(--ui-border)] hover:bg-[var(--ui-bg-elevated)]/50',
              ]"
              @click="state.type = opt.value"
            >
              <UIcon
                :name="typeIcon(opt.value)"
                :class="[
                  'size-5',
                  state.type === opt.value ? typeColors(opt.value).text : 'text-[var(--ui-text-muted)]',
                ]"
              />
              <span class="text-xs font-medium">{{ opt.label }}</span>
            </button>
          </div>
        </UFormField>

        <!-- Category selector -->
        <UFormField label="Category" name="category">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in allCategories"
              :key="cat.value"
              type="button"
              :class="[
                'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-150',
                state.category === cat.value
                  ? [categoryColors(cat.value).border, categoryColors(cat.value).bg, 'ring-1', categoryColors(cat.value).ring]
                  : 'border-[var(--ui-border)] hover:bg-[var(--ui-bg-elevated)]/50',
              ]"
              @click="state.category = cat.value"
            >
              <UIcon
                :name="cat.icon"
                :class="[
                  'size-4',
                  state.category === cat.value ? categoryColors(cat.value).text : 'text-[var(--ui-text-muted)]',
                ]"
              />
              <span>{{ cat.label }}</span>
            </button>
          </div>
        </UFormField>

        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Icon" name="icon">
            <UInput v-model="state.icon" placeholder="i-lucide-star" class="w-full">
              <template #leading>
                <UIcon :name="state.icon || 'i-lucide-star'" class="size-4" />
              </template>
            </UInput>
          </UFormField>

          <!-- Type-specific field -->
          <Transition name="field" mode="out-in">
            <UFormField
              v-if="state.type === 'timed'"
              key="timed"
              label="Duration (minutes)"
              name="requiredMinutes"
            >
              <UInput v-model.number="state.requiredMinutes" type="number" :min="1" class="w-full" />
            </UFormField>

            <UFormField
              v-else-if="state.type === 'banked'"
              key="banked"
              label="Default Quantity"
              name="quantity"
            >
              <UInput v-model.number="state.quantity" type="number" :min="1" class="w-full" />
            </UFormField>

            <UFormField
              v-else-if="state.type === 'counter'"
              key="counter"
              label="Target Count"
              name="targetCount"
            >
              <UInput v-model.number="state.targetCount" type="number" :min="1" class="w-full" />
            </UFormField>

            <div v-else key="none" />
          </Transition>
        </div>

        <UFormField label="Description" name="description">
          <UTextarea v-model="state.description" placeholder="What does this reward do?" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton label="Cancel" color="neutral" variant="outline" @click="open = false" />
          <UButton type="submit" :label="isEditing ? 'Save Changes' : 'Add Reward'" />
        </div>
      </UForm>
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
