<script setup lang="ts">
defineProps<{
  title: string
  message: string
  color?: 'primary' | 'error' | 'success' | 'warning'
  confirmLabel?: string
  confirmIcon?: string
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <span class="text-base font-semibold">{{ title }}</span>
    </template>

    <template #body>
      <p class="text-sm text-[var(--ui-text-muted)]">
        {{ message }}
      </p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="Cancel" color="neutral" variant="ghost" @click="emit('cancel')" />
        <UButton
          :label="confirmLabel ?? 'Confirm'"
          :color="color ?? 'primary'"
          :icon="confirmIcon"
          @click="emit('confirm')"
        />
      </div>
    </template>
  </UModal>
</template>
