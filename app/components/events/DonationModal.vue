<script setup lang="ts">
import type { FormError } from '@nuxt/ui'

const props = defineProps<{
  eventId: string
  fundraiserId: string
  fundraiserName: string
}>()

const open = defineModel<boolean>('open', { default: false })
const store = useEventsStore()
const toast = useToast()

const state = reactive({
  amount: 10,
})

function validate(): FormError[] {
  const errors: FormError[] = []
  if (state.amount <= 0) errors.push({ name: 'amount', message: 'Must be greater than 0' })
  return errors
}

function onSubmit() {
  store.addDonation(props.eventId, props.fundraiserId, state.amount)
  toast.add({ title: `$${state.amount} donation added!`, color: 'success' })
  state.amount = 10
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" title="Add Donation">
    <template #body>
      <p class="mb-4 text-sm text-[var(--ui-text-muted)]">
        Record a donation for <strong>{{ fundraiserName }}</strong>
      </p>

      <UForm :validate="validate" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Amount ($)" name="amount">
          <UInput v-model.number="state.amount" type="number" :min="1" :step="5" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton label="Cancel" color="neutral" variant="outline" @click="open = false" />
          <UButton type="submit" label="Add Donation" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
