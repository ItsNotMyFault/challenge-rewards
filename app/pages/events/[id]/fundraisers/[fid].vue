<script setup lang="ts">
import type { RewardCategory } from '~/types/rewards'
import { REDEEM_ACTIONS_KEY, CAN_MANAGE_REDEEMS_KEY, type RedeemActionInterface } from '~/composables/useRedeemActions'
import presetData from '~/data/redeem-presets.json'

const route = useRoute()
const { user } = useUserSession()
const eventsStore = useEventsStore()
const confirm = useConfirmAction()
const { categoryColors, allCategories } = useRewardHelpers()
const { typeIcon, typeLabel, typeColors } = useRedeemHelpers()

const eventId = computed(() => route.params.id as string)
const fundraiserId = computed(() => route.params.fid as string)

await useAsyncData(`event-${eventId.value}`, () => eventsStore.fetchEvent(eventId.value))

const event = computed(() => eventsStore.getEvent(eventId.value))
const fundraiser = computed(() => eventsStore.getFundraiser(eventId.value, fundraiserId.value))

const isOwner = computed(() => {
  if (!user.value) return false
  return fundraiser.value?.userId === user.value.id
})

const canManage = computed(() => {
  if (!user.value) return false
  if (user.value.isAdmin) return true
  return isOwner.value
})

// Provide event-scoped redeem actions
const redeemActions: RedeemActionInterface = {
  startTimer: id => eventsStore.fundraiserStartTimer(eventId.value, fundraiserId.value, id),
  pauseTimer: id => eventsStore.fundraiserPauseTimer(eventId.value, fundraiserId.value, id),
  completeTimer: id => eventsStore.fundraiserCompleteTimer(eventId.value, fundraiserId.value, id),
  consumeBanked: id => eventsStore.fundraiserConsumeBanked(eventId.value, fundraiserId.value, id),
  addToBanked: (id, amount) => eventsStore.fundraiserAddToBanked(eventId.value, fundraiserId.value, id, amount),
  completeInstant: id => eventsStore.fundraiserCompleteInstant(eventId.value, fundraiserId.value, id),
  incrementCounter: id => eventsStore.fundraiserIncrementCounter(eventId.value, fundraiserId.value, id),
  decrementCounter: id => eventsStore.fundraiserDecrementCounter(eventId.value, fundraiserId.value, id),
  activateToggle: id => eventsStore.fundraiserActivateToggle(eventId.value, fundraiserId.value, id),
  deactivateToggle: id => eventsStore.fundraiserDeactivateToggle(eventId.value, fundraiserId.value, id),
  deleteRedeem: id => eventsStore.fundraiserDeleteRedeem(eventId.value, fundraiserId.value, id),
  resetRedeem: id => eventsStore.fundraiserResetRedeem(eventId.value, fundraiserId.value, id),
  updateNote: (id, note) => eventsStore.fundraiserUpdateNote(eventId.value, fundraiserId.value, id, note),
}

provide(REDEEM_ACTIONS_KEY, redeemActions)
provide(CAN_MANAGE_REDEEMS_KEY, isOwner)

const catalogModalOpen = ref(false)
const showDetails = ref(false)

const presetMap = new Map(presetData.presets.map(p => [p.id, p]))
const catalogRewards = computed(() => {
  if (!fundraiser.value) return []
  return fundraiser.value.rewardCatalogIds
    .map(id => presetMap.get(id))
    .filter(Boolean) as typeof presetData.presets
})

// Filters
const searchQuery = ref('')
const categoryFilter = ref<RewardCategory | null>(null)
const statusFilter = ref<'all' | 'active' | 'completed'>('all')

const filteredRedeems = computed(() => {
  if (!fundraiser.value) return []
  let result = fundraiser.value.redeems

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      r =>
        r.rewardName.toLowerCase().includes(q)
        || r.redeemer.toLowerCase().includes(q)
        || r.note.toLowerCase().includes(q),
    )
  }

  if (categoryFilter.value) {
    result = result.filter(r => r.category === categoryFilter.value)
  }

  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'active') {
      result = result.filter(r => r.status !== 'completed')
    }
    else {
      result = result.filter(r => r.status === 'completed')
    }
  }

  return result.slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
})

const totalCount = computed(() => fundraiser.value?.redeems.length ?? 0)
const activeCount = computed(() => fundraiser.value?.redeems.filter(r => r.status !== 'completed').length ?? 0)
const completedCount = computed(() => fundraiser.value?.redeems.filter(r => r.status === 'completed').length ?? 0)

function toggleCategoryFilter(c: RewardCategory) {
  categoryFilter.value = categoryFilter.value === c ? null : c
}

const statusTabs = [
  { label: 'All', value: 'all' as const },
  { label: 'Active', value: 'active' as const },
  { label: 'Completed', value: 'completed' as const },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
}

const avatarClasses = computed(() => {
  const map: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
    violet: 'bg-violet-500/10 text-violet-500',
    rose: 'bg-rose-500/10 text-rose-500',
    cyan: 'bg-cyan-500/10 text-cyan-500',
    orange: 'bg-orange-500/10 text-orange-500',
    teal: 'bg-teal-500/10 text-teal-500',
  }
  return map[fundraiser.value?.avatarColor ?? 'blue'] || map.blue
})

const initials = computed(() => {
  return fundraiser.value?.name.slice(0, 2).toUpperCase() ?? '??'
})

function confirmDeleteFundraiser() {
  confirm.requestConfirm({
    title: 'Delete Fundraiser',
    message: `Remove "${fundraiser.value?.name}" from this event? All their redeems will be lost.`,
    color: 'error',
    confirmLabel: 'Delete',
    confirmIcon: 'i-lucide-trash-2',
    action: async () => {
      await eventsStore.deleteFundraiser(eventId.value, fundraiserId.value)
      navigateTo(`/events/${eventId.value}`)
    },
  })
}
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div v-if="fundraiser && event" class="relative">
      <div class="relative mx-auto max-w-7xl p-4">
        <!-- Back + actions -->
        <div class="mb-4 flex items-center justify-between">
          <UButton icon="i-lucide-arrow-left" :label="event.name" color="neutral" variant="ghost" :to="`/events/${eventId}`" />
          <UButton v-if="canManage" icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" @click="confirmDeleteFundraiser" />
        </div>

        <!-- Fundraiser header -->
        <div class="mb-8 rounded-xl bg-[var(--ui-bg-elevated)]/50 p-5 ring-1 ring-[var(--ui-border)]">
          <div class="flex items-start gap-4">
            <span
              :class="[
                'flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-bold',
                avatarClasses,
              ]"
            >
              {{ initials }}
            </span>
            <div class="min-w-0 flex-1 space-y-3">
              <div>
                <h1 class="text-xl font-bold">{{ fundraiser.name }}</h1>
                <div class="mt-1 flex flex-wrap items-center gap-3">
                  <a
                    v-if="fundraiser.twitchUrl"
                    :href="fundraiser.twitchUrl"
                    target="_blank"
                    class="inline-flex items-center gap-1 text-sm text-purple-400 hover:underline"
                  >
                    <UIcon name="i-lucide-tv" class="size-4" />
                    Twitch
                  </a>
                  <a
                    v-if="fundraiser.donationUrl"
                    :href="fundraiser.donationUrl"
                    target="_blank"
                    class="inline-flex items-center gap-1 text-sm text-[var(--ui-primary)] hover:underline"
                  >
                    <UIcon name="i-lucide-heart" class="size-4" />
                    Donate
                  </a>
                </div>
              </div>

              <EventsEventProgressBar :raised="fundraiser.raised" :goal="fundraiser.goal" />

              <button
                v-if="catalogRewards.length > 0"
                class="flex cursor-pointer items-center gap-1 text-xs text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]"
                @click="showDetails = !showDetails"
              >
                <UIcon :name="showDetails ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="size-3.5" />
                {{ showDetails ? 'Hide details' : `Show details (${catalogRewards.length} reward${catalogRewards.length !== 1 ? 's' : ''})` }}
              </button>
            </div>
          </div>

          <div v-if="showDetails && catalogRewards.length > 0" class="mt-4 border-t border-[var(--ui-border)] pt-3">
            <div class="grid gap-2 sm:grid-cols-2">
              <div
                v-for="reward in catalogRewards"
                :key="reward.id"
                class="flex items-center gap-2.5 rounded-lg bg-[var(--ui-bg)]/50 px-3 py-2 ring-1 ring-[var(--ui-border)]"
              >
                <span
                  :class="[
                    'flex size-7 shrink-0 items-center justify-center rounded-md',
                    categoryColors(reward.category as any).bg,
                  ]"
                >
                  <UIcon :name="reward.icon" :class="['size-3.5', categoryColors(reward.category as any).text]" />
                </span>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-xs font-medium">{{ reward.rewardName }}</div>
                  <div class="truncate text-[10px] text-[var(--ui-text-muted)]">{{ reward.description }}</div>
                </div>
                <UBadge :label="typeLabel(reward.type as any)" color="neutral" variant="outline" size="xs">
                  <template #leading>
                    <UIcon :name="typeIcon(reward.type as any)" :class="['size-3', typeColors(reward.type as any).text]" />
                  </template>
                </UBadge>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter bar + Redeems -->
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Redeems</h2>
          <UButton v-if="isOwner" icon="i-lucide-plus" size="sm" @click="catalogModalOpen = true" />
        </div>

        <div class="flex gap-6">
          <!-- Left: filters + grid -->
          <div class="min-w-0 flex-1">
            <div class="mb-6 space-y-2.5 rounded-xl bg-[var(--ui-bg-elevated)]/50 p-3 ring-1 ring-[var(--ui-border)]">
              <!-- Row 1: category badges + status tabs -->
              <div class="flex items-center gap-2">
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="cat in allCategories"
                    :key="cat.value"
                    class="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 ring-1 transition-all"
                    :class="categoryFilter === cat.value
                      ? [categoryColors(cat.value).bg, categoryColors(cat.value).ring, 'ring-2']
                      : 'bg-[var(--ui-bg-elevated)]/50 ring-[var(--ui-border)] hover:ring-[var(--ui-primary)]/30'"
                    @click="toggleCategoryFilter(cat.value)"
                  >
                    <UIcon :name="cat.icon" :class="['size-3.5', categoryColors(cat.value).text]" />
                    <span class="text-xs font-medium">{{ cat.label }}</span>
                  </button>
                </div>

                <USeparator orientation="vertical" class="mx-1 hidden h-6 sm:block" />

                <div class="flex gap-1">
                  <UButton
                    v-for="tab in statusTabs"
                    :key="tab.value"
                    :label="`${tab.label} (${tab.value === 'all' ? totalCount : tab.value === 'active' ? activeCount : completedCount})`"
                    :color="statusFilter === tab.value ? 'primary' : 'neutral'"
                    :variant="statusFilter === tab.value ? 'subtle' : 'ghost'"
                    size="xs"
                    @click="statusFilter = tab.value"
                  />
                </div>
              </div>

              <!-- Row 2: search -->
              <UInput
                v-model="searchQuery"
                icon="i-lucide-search"
                placeholder="Search redeems..."
                class="w-full"
                size="sm"
              />
            </div>

            <!-- Redeem grid -->
            <TransitionGroup
              v-if="filteredRedeems.length > 0"
              tag="div"
              name="card"
              class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              <RedeemsRedeemCard
                v-for="redeem in filteredRedeems"
                :key="redeem.id"
                :redeem="redeem"
              />
            </TransitionGroup>

            <div
              v-else
              class="mt-8 flex flex-col items-center justify-center text-center"
            >
              <div class="flex size-16 items-center justify-center rounded-full bg-[var(--ui-bg-elevated)]">
                <UIcon name="i-lucide-inbox" class="size-8 text-[var(--ui-text-muted)]" />
              </div>
              <h3 class="mt-3 text-base font-semibold">No redeems yet</h3>
              <p class="mt-1 max-w-sm text-sm text-[var(--ui-text-muted)]">
                {{ isOwner ? 'Add a redeem from this fundraiser\'s reward catalog.' : 'No redeems have been added yet.' }}
              </p>
              <UButton
                v-if="isOwner"
                class="mt-3"
                icon="i-lucide-plus"
                label="Add Redeem"
                @click="catalogModalOpen = true"
              />
            </div>
          </div>

          <!-- Right: leaderboard -->
          <div class="hidden w-72 shrink-0 lg:block">
            <div class="sticky top-4">
              <RedeemsRedeemLeaderboard :redeems="fundraiser.redeems" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="flex h-full items-center justify-center">
      <div class="text-center">
        <UIcon name="i-lucide-user-x" class="mx-auto size-12 text-[var(--ui-text-muted)]" />
        <h2 class="mt-4 text-lg font-semibold">Fundraiser not found</h2>
        <UButton class="mt-3" label="Back to Events" to="/events" />
      </div>
    </div>

    <EventsFundraiserCatalogModal
      v-if="fundraiser"
      v-model:open="catalogModalOpen"
      :event-id="eventId"
      :fundraiser-id="fundraiserId"
      :catalog-ids="fundraiser.rewardCatalogIds"
    />

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
  </div>
</template>

<style scoped>
.card-enter-active,
.card-leave-active {
  transition: all 0.3s ease;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

.card-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

.card-move {
  transition: transform 0.3s ease;
}
</style>
