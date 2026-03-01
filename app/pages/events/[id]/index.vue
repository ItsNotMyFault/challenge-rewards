<script setup lang="ts">
import type { GameEvent } from '~/types/events'

const route = useRoute()
const store = useEventsStore()
const confirm = useConfirmAction()

const eventId = computed(() => route.params.id as string)
const event = computed(() => store.getEvent(eventId.value))
const raised = computed(() => store.eventRaised(eventId.value))
const allRedeems = computed(() => event.value?.fundraisers.flatMap(f => f.redeems) ?? [])

const editModalOpen = ref(false)

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
}

function confirmDelete() {
  confirm.requestConfirm({
    title: 'Delete Event',
    message: `Delete "${event.value?.name}"? This will remove all fundraisers and their redeems. This cannot be undone.`,
    color: 'error',
    confirmLabel: 'Delete',
    confirmIcon: 'i-lucide-trash-2',
    action: () => {
      store.deleteEvent(eventId.value)
      navigateTo('/events')
    },
  })
}

const statusOptions = [
  { label: 'Active', value: 'active' as const, icon: 'i-lucide-play' },
  { label: 'Completed', value: 'completed' as const, icon: 'i-lucide-check' },
  { label: 'Draft', value: 'draft' as const, icon: 'i-lucide-pencil' },
]

const menuItems = computed(() => [
  [
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect: () => { editModalOpen.value = true },
    },
  ],
  statusOptions.filter(s => s.value !== event.value?.status).map(s => ({
    label: `Mark as ${s.label}`,
    icon: s.icon,
    onSelect: () => store.updateEvent(eventId.value, { status: s.value }),
  })),
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
  <div class="h-full overflow-y-auto">
    <div v-if="event" class="relative">
      <div class="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[var(--ui-primary)]/5 to-transparent" />

      <div class="relative mx-auto max-w-7xl p-4">
        <!-- Back + actions -->
        <div class="mb-4 flex items-center justify-between">
          <UButton icon="i-lucide-arrow-left" label="Events" color="neutral" variant="ghost" to="/events" />
          <UDropdownMenu :items="menuItems">
            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
          </UDropdownMenu>
        </div>

        <!-- Event header -->
        <div class="mb-8 space-y-4">
          <div class="flex items-start gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold">{{ event.name }}</h1>
                <UBadge
                  :color="event.status === 'active' ? 'success' : event.status === 'completed' ? 'info' : 'neutral'"
                  variant="subtle"
                  size="sm"
                >
                  {{ event.status }}
                </UBadge>
              </div>
              <p v-if="event.description" class="mt-2 text-sm text-[var(--ui-text-muted)]">
                {{ event.description }}
              </p>
            </div>
          </div>

          <!-- Global progress -->
          <div class="rounded-xl bg-[var(--ui-bg-elevated)]/50 p-4 ring-1 ring-[var(--ui-border)]">
            <EventsEventProgressBar :raised="raised" :goal="event.goal" />
            <div class="mt-3 flex items-center gap-3">
              <span class="inline-flex items-center gap-1 text-sm text-[var(--ui-text-muted)]">
                <UIcon name="i-lucide-users" class="size-4" />
                {{ event.fundraisers.length }} fundraiser{{ event.fundraisers.length !== 1 ? 's' : '' }}
              </span>
              <a
                v-if="event.donationUrl"
                :href="event.donationUrl"
                target="_blank"
                class="inline-flex items-center gap-1 text-sm text-[var(--ui-primary)] hover:underline"
              >
                <UIcon name="i-lucide-external-link" class="size-4" />
                Event Donation Page
              </a>
            </div>
          </div>
        </div>

        <!-- Fundraisers section -->
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Fundraisers</h2>
          <UButton icon="i-lucide-user-plus" label="Join Event" :to="`/events/${eventId}/join`" />
        </div>

        <div class="flex gap-6">
          <!-- Left: fundraiser grid -->
          <div class="min-w-0 flex-1">
            <TransitionGroup
              v-if="event.fundraisers.length > 0"
              tag="div"
              name="card"
              class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              <EventsFundraiserCard
                v-for="fundraiser in event.fundraisers"
                :key="fundraiser.id"
                :fundraiser="fundraiser"
                :event-id="event.id"
              />
            </TransitionGroup>

            <div
              v-else
              class="mt-8 flex flex-col items-center justify-center text-center"
            >
              <div class="flex size-16 items-center justify-center rounded-full bg-[var(--ui-bg-elevated)]">
                <UIcon name="i-lucide-users" class="size-8 text-[var(--ui-text-muted)]" />
              </div>
              <h3 class="mt-3 text-base font-semibold">No fundraisers yet</h3>
              <p class="mt-1 max-w-sm text-sm text-[var(--ui-text-muted)]">
                Be the first to join this event!
              </p>
              <UButton
                class="mt-3"
                icon="i-lucide-user-plus"
                label="Join Event"
                :to="`/events/${eventId}/join`"
              />
            </div>
          </div>

          <!-- Right: leaderboard -->
          <div v-if="allRedeems.length > 0" class="hidden w-72 shrink-0 lg:block">
            <div class="sticky top-4">
              <RedeemsRedeemLeaderboard :redeems="allRedeems" />
            </div>
          </div>
        </div>
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

    <EventsEventFormModal v-model:open="editModalOpen" :event="event" />

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
