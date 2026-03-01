<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'
import presetData from '~/data/redeem-presets.json'

const route = useRoute()
const store = useEventsStore()
const toast = useToast()
const { allCategories, categoryColors } = useRewardHelpers()
const { typeIcon, typeLabel, typeColors } = useRedeemHelpers()

const eventId = computed(() => route.params.id as string)
const event = computed(() => store.getEvent(eventId.value))

const stepper = useTemplateRef('stepper')

const steps: StepperItem[] = [
  {
    slot: 'info' as const,
    title: 'Your Info',
    description: 'Tell us about yourself',
    icon: 'i-lucide-user',
  },
  {
    slot: 'rewards' as const,
    title: 'Rewards',
    description: 'Pick your reward catalog',
    icon: 'i-lucide-gift',
  },
  {
    slot: 'complete' as const,
    title: 'Complete',
    description: 'Review and join',
    icon: 'i-lucide-check-circle',
  },
]

// Form state
const name = ref('')
const goal = ref(500)
const twitchUrl = ref('')
const donationUrl = ref('')
const selectedPresetIds = ref<string[]>([])

// Validation
const infoError = ref('')
const rewardsError = ref('')

// Reward catalog filters
const categoryFilter = ref<string | null>(null)
const searchQuery = ref('')

const filteredPresets = computed(() => {
  let result = presetData.presets

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => p.rewardName.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  }

  if (categoryFilter.value) {
    result = result.filter(p => p.category === categoryFilter.value)
  }

  return result
})

function togglePreset(id: string) {
  const idx = selectedPresetIds.value.indexOf(id)
  if (idx === -1) selectedPresetIds.value.push(id)
  else selectedPresetIds.value.splice(idx, 1)
}

function nextFromInfo() {
  if (!name.value.trim()) {
    infoError.value = 'Please enter your name.'
    return
  }
  if (goal.value <= 0) {
    infoError.value = 'Goal must be greater than $0.'
    return
  }
  infoError.value = ''
  stepper.value?.next()
}

function nextFromRewards() {
  if (selectedPresetIds.value.length === 0) {
    rewardsError.value = 'Select at least one reward.'
    return
  }
  rewardsError.value = ''
  stepper.value?.next()
}

function submit() {
  const id = store.addFundraiser(eventId.value, {
    name: name.value.trim(),
    goal: goal.value,
    twitchUrl: twitchUrl.value.trim(),
    donationUrl: donationUrl.value.trim(),
    rewardCatalogIds: [...selectedPresetIds.value],
  })

  if (id) {
    toast.add({ title: 'Welcome aboard!', description: `You've joined ${event.value?.name} as a fundraiser.`, color: 'success' })
    navigateTo(`/events/${eventId.value}/fundraisers/${id}`)
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
}
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div v-if="event" class="relative">
      <div class="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[var(--ui-primary)]/5 to-transparent" />

      <div class="relative mx-auto max-w-3xl p-4">
        <!-- Back -->
        <div class="mb-6">
          <UButton icon="i-lucide-arrow-left" :label="event.name" color="neutral" variant="ghost" :to="`/events/${eventId}`" />
        </div>

        <h1 class="mb-6 text-2xl font-bold">Join {{ event.name }}</h1>

        <UStepper
          ref="stepper"
          :items="steps"
          disabled
          class="w-full"
        >
          <!-- Step 1: Info -->
          <template #info>
            <div class="mt-6 space-y-5">
              <div class="grid gap-4 sm:grid-cols-2">
                <UFormField label="Your Name" required>
                  <UInput v-model="name" placeholder="Display name" class="w-full" />
                </UFormField>

                <UFormField label="Goal ($)" required>
                  <UInput v-model.number="goal" type="number" :min="1" class="w-full" />
                </UFormField>

                <UFormField label="Twitch URL" description="Optional">
                  <UInput v-model="twitchUrl" placeholder="https://twitch.tv/..." class="w-full" />
                </UFormField>

                <UFormField label="Donation Link" description="Optional">
                  <UInput v-model="donationUrl" placeholder="https://..." class="w-full" />
                </UFormField>
              </div>

              <p v-if="infoError" class="text-sm text-[var(--ui-error)]">{{ infoError }}</p>

              <div class="flex justify-end">
                <UButton trailing-icon="i-lucide-arrow-right" label="Next" @click="nextFromInfo" />
              </div>
            </div>
          </template>

          <!-- Step 2: Rewards -->
          <template #rewards>
            <div class="mt-6 space-y-4">
              <div class="rounded-xl bg-[var(--ui-bg-elevated)]/50 p-3 ring-1 ring-[var(--ui-border)]">
                <div class="mb-2 flex flex-wrap gap-1">
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

                <UInput
                  v-model="searchQuery"
                  icon="i-lucide-search"
                  placeholder="Search rewards..."
                  size="sm"
                  class="w-full"
                />
              </div>

              <div class="max-h-80 space-y-1 overflow-y-auto">
                <button
                  v-for="preset in filteredPresets"
                  :key="preset.id"
                  type="button"
                  class="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all"
                  :class="selectedPresetIds.includes(preset.id)
                    ? 'border-[var(--ui-primary)] bg-[var(--ui-primary)]/5 ring-1 ring-[var(--ui-primary)]/30'
                    : 'border-[var(--ui-border)] hover:bg-[var(--ui-bg-elevated)]/50'"
                  @click="togglePreset(preset.id)"
                >
                  <UIcon
                    :name="selectedPresetIds.includes(preset.id) ? 'i-lucide-check-square' : 'i-lucide-square'"
                    :class="selectedPresetIds.includes(preset.id) ? 'text-[var(--ui-primary)]' : 'text-[var(--ui-text-muted)]'"
                    class="size-4 shrink-0"
                  />
                  <span
                    :class="[
                      'flex size-7 shrink-0 items-center justify-center rounded-md',
                      categoryColors(preset.category as any).bg,
                    ]"
                  >
                    <UIcon :name="preset.icon" :class="['size-3.5', categoryColors(preset.category as any).text]" />
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

              <p class="flex items-center gap-1.5 text-xs text-[var(--ui-text-muted)]">
                <UIcon name="i-lucide-info" class="size-3.5 shrink-0" />
                You can add or create more rewards later from your fundraiser page.
              </p>

              <p v-if="rewardsError" class="text-sm text-[var(--ui-error)]">{{ rewardsError }}</p>

              <div class="flex justify-between">
                <UButton icon="i-lucide-arrow-left" label="Back" color="neutral" variant="ghost" @click="stepper?.prev()" />
                <UButton trailing-icon="i-lucide-arrow-right" label="Next" @click="nextFromRewards" />
              </div>
            </div>
          </template>

          <!-- Step 3: Complete -->
          <template #complete>
            <div class="mt-6 space-y-5">
              <div class="rounded-xl bg-[var(--ui-bg-elevated)]/50 p-5 ring-1 ring-[var(--ui-border)]">
                <h3 class="mb-4 text-base font-semibold">Review</h3>
                <dl class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <dt class="text-[var(--ui-text-muted)]">Name</dt>
                    <dd class="font-medium">{{ name }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-[var(--ui-text-muted)]">Goal</dt>
                    <dd class="font-medium">{{ formatCurrency(goal) }}</dd>
                  </div>
                  <div v-if="twitchUrl" class="flex justify-between">
                    <dt class="text-[var(--ui-text-muted)]">Twitch</dt>
                    <dd class="truncate pl-4 font-medium">{{ twitchUrl }}</dd>
                  </div>
                  <div v-if="donationUrl" class="flex justify-between">
                    <dt class="text-[var(--ui-text-muted)]">Donation Link</dt>
                    <dd class="truncate pl-4 font-medium">{{ donationUrl }}</dd>
                  </div>
                  <USeparator />
                  <div class="flex justify-between">
                    <dt class="text-[var(--ui-text-muted)]">Rewards selected</dt>
                    <dd class="font-medium">{{ selectedPresetIds.length }}</dd>
                  </div>
                </dl>
              </div>

              <div class="flex justify-between">
                <UButton icon="i-lucide-arrow-left" label="Back" color="neutral" variant="ghost" @click="stepper?.prev()" />
                <UButton icon="i-lucide-rocket" label="Join Event" @click="submit" />
              </div>
            </div>
          </template>
        </UStepper>
      </div>
    </div>

    <!-- Event not found -->
    <div v-else class="flex h-full items-center justify-center">
      <div class="text-center">
        <UIcon name="i-lucide-calendar-x" class="mx-auto size-12 text-[var(--ui-text-muted)]" />
        <h2 class="mt-4 text-lg font-semibold">Event not found</h2>
        <UButton class="mt-3" label="Back to Events" to="/events" />
      </div>
    </div>
  </div>
</template>
