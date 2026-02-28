<script setup lang="ts">
import type { SkillTreeNode } from '~/types/challenges'

const props = defineProps<{
  challenge: SkillTreeNode | null
}>()

const open = defineModel<boolean>('open', { default: false })

const store = useChallengesStore()
const { categoryColors } = useChallengeHelpers()

const isCompleted = computed(() =>
  props.challenge ? store.isSkillTreeChallengeCompleted(props.challenge.id) : false,
)

function toggleComplete() {
  if (props.challenge) {
    store.toggleSkillTreeChallenge(props.challenge.id)
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="size-4 rounded"
          :style="{ backgroundColor: challenge ? categoryColors[challenge.category] : '#444' }"
        />
        <span class="text-lg font-semibold">{{ challenge?.label ?? 'Challenge' }}</span>
      </div>
    </template>

    <template #body>
      <div v-if="challenge" class="space-y-5">
        <div class="flex items-center gap-2">
          <UBadge
            :label="challenge.category"
            variant="subtle"
            color="neutral"
            class="capitalize"
          />
        </div>

        <p class="leading-relaxed text-gray-400">
          {{ challenge.description }}
        </p>

        <div
          v-if="isCompleted"
          class="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2"
        >
          <UIcon name="i-lucide-circle-check" class="size-5 text-green-500" />
          <span class="text-sm font-medium text-green-400">Completed</span>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          label="Close"
          color="neutral"
          variant="ghost"
          @click="open = false"
        />
        <UButton
          :label="isCompleted ? 'Mark Incomplete' : 'Mark Complete'"
          :color="isCompleted ? 'error' : 'success'"
          :variant="isCompleted ? 'soft' : 'solid'"
          :icon="isCompleted ? 'i-lucide-x' : 'i-lucide-check'"
          @click="toggleComplete"
        />
      </div>
    </template>
  </UModal>
</template>
