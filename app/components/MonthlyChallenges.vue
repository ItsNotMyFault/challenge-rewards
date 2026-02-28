<script setup lang="ts">
import { monthlyChallenges } from '~/data/monthly-challenges'
import type { MonthlyChallenge } from '~/types/challenges'

const store = useChallengesStore()
const { categoryColors } = useChallengeHelpers()

function weekCompletedCount(challenge: MonthlyChallenge): number {
  return challenge.weeks.filter(w =>
    store.isMonthlySubChallengeCompleted(w.id),
  ).length
}

function isChallengeFullyComplete(challenge: MonthlyChallenge): boolean {
  return weekCompletedCount(challenge) === challenge.weeks.length
}
</script>

<template>
  <div class="grid gap-5 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
    <UCard
      v-for="challenge in monthlyChallenges"
      :key="challenge.id"
      class="transition-shadow duration-200 hover:shadow-lg hover:shadow-white/5"
    >
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2.5">
              <div
                class="size-2.5 shrink-0 rounded-full"
                :style="{ backgroundColor: categoryColors[challenge.category] }"
              />
              <h3 class="truncate text-base font-semibold">
                {{ challenge.label }}
              </h3>
            </div>
            <p class="mt-1.5 text-xs leading-relaxed text-gray-500">
              {{ challenge.description }}
            </p>
          </div>
          <UBadge
            :label="challenge.category"
            variant="subtle"
            size="xs"
            color="neutral"
            class="shrink-0 capitalize"
          />
        </div>
        <div class="mt-3 space-y-1">
          <UProgress
            :model-value="weekCompletedCount(challenge)"
            :max="challenge.weeks.length"
            size="xs"
            :color="isChallengeFullyComplete(challenge) ? 'success' : 'primary'"
          />
          <div class="flex justify-between text-xs text-gray-500">
            <span>{{ weekCompletedCount(challenge) }} / {{ challenge.weeks.length }} weeks</span>
            <span v-if="isChallengeFullyComplete(challenge)" class="font-medium text-green-400">Done!</span>
          </div>
        </div>
      </template>

      <div class="space-y-2">
        <button
          v-for="week in challenge.weeks"
          :key="week.id"
          class="flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors duration-150"
          :class="store.isMonthlySubChallengeCompleted(week.id)
            ? 'bg-green-500/10 hover:bg-green-500/15'
            : 'bg-white/[0.03] hover:bg-white/[0.06]'"
          @click="store.toggleMonthlySubChallenge(week.id)"
        >
          <UIcon
            :name="store.isMonthlySubChallengeCompleted(week.id)
              ? 'i-lucide-circle-check'
              : 'i-lucide-circle'"
            class="mt-0.5 size-5 shrink-0 transition-colors"
            :class="store.isMonthlySubChallengeCompleted(week.id)
              ? 'text-green-500'
              : 'text-gray-600'"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <UBadge :label="`W${week.week}`" variant="subtle" size="xs" color="neutral" />
              <span
                class="text-sm font-medium transition-colors"
                :class="store.isMonthlySubChallengeCompleted(week.id)
                  ? 'text-gray-400 line-through'
                  : 'text-gray-200'"
              >{{ week.label }}</span>
            </div>
            <p class="mt-0.5 text-xs text-gray-500">
              {{ week.goal }}
            </p>
          </div>
        </button>
      </div>
    </UCard>
  </div>
</template>
