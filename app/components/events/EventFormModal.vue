<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import type { GameEvent } from '~/types/events'

const props = defineProps<{
  event?: GameEvent | null
}>()

const open = defineModel<boolean>('open', { default: false })
const store = useEventsStore()
const toast = useToast()

const isEditing = computed(() => !!props.event)

const state = reactive({
  name: '',
  description: '',
  goal: 1000,
  donationUrl: '',
})

watch(open, (isOpen) => {
  if (isOpen && props.event) {
    state.name = props.event.name
    state.description = props.event.description
    state.goal = props.event.goal
    state.donationUrl = props.event.donationUrl
  }
  else if (isOpen) {
    resetState()
  }
})

function resetState() {
  state.name = ''
  state.description = ''
  state.goal = 1000
  state.donationUrl = ''
}

function validate(): FormError[] {
  const errors: FormError[] = []
  if (!state.name.trim()) errors.push({ name: 'name', message: 'Required' })
  if (state.goal <= 0) errors.push({ name: 'goal', message: 'Must be greater than 0' })
  return errors
}

async function onSubmit() {
  if (isEditing.value && props.event) {
    await store.updateEvent(props.event.id, {
      name: state.name.trim(),
      description: state.description.trim(),
      goal: state.goal,
      donationUrl: state.donationUrl.trim(),
    })
    toast.add({ title: 'Event updated', color: 'success' })
  }
  else {
    await store.createEvent({
      name: state.name.trim(),
      description: state.description.trim(),
      goal: state.goal,
      donationUrl: state.donationUrl.trim(),
    })
    toast.add({ title: 'Event created', color: 'success' })
  }
  resetState()
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="isEditing ? 'Edit Event' : 'Create Event'">
    <template #body>
      <UForm :validate="validate" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Event Name" name="name">
          <UInput v-model="state.name" placeholder="e.g., Charity Ride 2026" class="w-full" />
        </UFormField>

        <UFormField label="Description" name="description">
          <UTextarea v-model="state.description" placeholder="What is this event about?" class="w-full" />
        </UFormField>

        <UFormField label="Goal ($)" name="goal">
          <UInput v-model.number="state.goal" type="number" :min="1" class="w-full" />
        </UFormField>

        <UFormField label="Donation Link (optional)" name="donationUrl">
          <UInput v-model="state.donationUrl" placeholder="https://..." class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton label="Cancel" color="neutral" variant="outline" @click="open = false" />
          <UButton type="submit" :label="isEditing ? 'Save' : 'Create Event'" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
