<script setup lang="ts">
import type { GameEvent } from '~/types/events'

const store = useEventsStore()
const formModalOpen = ref(false)
const editingEvent = ref<GameEvent | null>(null)

store.seedDefaultEvent()

function openCreate() {
  editingEvent.value = null
  formModalOpen.value = true
}
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[var(--ui-primary)]/5 to-transparent" />

    <div class="relative mx-auto max-w-7xl p-4">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h1 class="text-xl font-bold">Events</h1>
          <UBadge v-if="store.events.length > 0" :label="`${store.events.length}`" color="neutral" variant="subtle" size="sm" />
        </div>
        <UButton icon="i-lucide-plus" label="Create Event" @click="openCreate" />
      </div>

      <!-- Event grid -->
      <TransitionGroup
        v-if="store.events.length > 0"
        tag="div"
        name="card"
        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <EventsEventCard
          v-for="event in store.events"
          :key="event.id"
          :event="event"
        />
      </TransitionGroup>

      <!-- Empty state -->
      <div
        v-else
        class="mt-16 flex flex-col items-center justify-center text-center"
      >
        <div class="flex size-20 items-center justify-center rounded-full bg-[var(--ui-bg-elevated)]">
          <UIcon name="i-lucide-calendar-heart" class="size-10 text-[var(--ui-text-muted)]" />
        </div>
        <h3 class="mt-4 text-lg font-semibold">No events yet</h3>
        <p class="mt-1 max-w-sm text-sm text-[var(--ui-text-muted)]">
          Create your first fundraising event to get started.
        </p>
        <UButton
          class="mt-4"
          icon="i-lucide-plus"
          label="Create Event"
          @click="openCreate"
        />
      </div>
    </div>

    <EventsEventFormModal v-model:open="formModalOpen" :event="editingEvent" />
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
