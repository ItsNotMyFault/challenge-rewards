<script setup lang="ts">
import type { Fundraiser } from '~/types/events'

const props = defineProps<{
  fundraiser: Fundraiser
  eventId: string
}>()

const { user } = useUserSession()
const isYou = computed(() => !!user.value && props.fundraiser.userId === user.value.id)

const progress = computed(() => {
  if (props.fundraiser.goal <= 0) return 0
  return Math.min((props.fundraiser.raised / props.fundraiser.goal) * 100, 100)
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
}

const initials = computed(() => {
  return props.fundraiser.name.slice(0, 2).toUpperCase()
})

const activeRedeems = computed(() => {
  return props.fundraiser.redeems.filter(r => r.status !== 'completed').length
})

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
  return map[props.fundraiser.avatarColor] || map.blue
})
</script>

<template>
  <NuxtLink :to="`/events/${eventId}/fundraisers/${fundraiser.id}`" class="block">
    <UCard
      variant="outline"
      :class="[
        'transition-all duration-200 hover:shadow-lg hover:shadow-[var(--ui-primary)]/5',
        isYou && 'ring-2 ring-[var(--ui-primary)]/40',
      ]"
      :ui="{ root: 'h-full flex flex-col', body: 'flex-1' }"
    >
      <template #header>
        <div class="flex items-start gap-3">
          <span
            :class="[
              'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
              avatarClasses,
            ]"
          >
            {{ initials }}
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="flex items-center gap-1.5 text-sm font-bold leading-tight">
              <span class="truncate">{{ fundraiser.name }}</span>
              <span v-if="isYou" class="shrink-0 text-xs font-normal text-[var(--ui-primary)]">(me)</span>
            </h3>
            <div class="mt-1 flex items-center gap-2">
              <a
                v-if="fundraiser.twitchUrl"
                :href="fundraiser.twitchUrl"
                target="_blank"
                class="inline-flex items-center gap-1 text-xs text-purple-400 hover:underline"
                @click.stop
              >
                <UIcon name="i-lucide-tv" class="size-3" />
                Twitch
              </a>
              <a
                v-if="fundraiser.donationUrl"
                :href="fundraiser.donationUrl"
                target="_blank"
                class="inline-flex items-center gap-1 text-xs text-[var(--ui-primary)] hover:underline"
                @click.stop
              >
                <UIcon name="i-lucide-heart" class="size-3" />
                Donate
              </a>
            </div>
          </div>
        </div>
      </template>

      <div class="space-y-2">
        <div class="flex items-end justify-between text-sm">
          <span class="font-bold text-green-600">{{ formatCurrency(fundraiser.raised) }}</span>
          <span class="text-xs text-[var(--ui-text-muted)]">of {{ formatCurrency(fundraiser.goal) }}</span>
        </div>
        <StaticProgressBar :value="progress" />
      </div>

      <template #footer>
        <div class="flex items-center justify-between text-xs text-[var(--ui-text-muted)]">
          <UTooltip text="Rewards available in this fundraiser's catalog">
            <span class="inline-flex items-center gap-1">
              <UIcon name="i-lucide-gift" class="size-3" />
              {{ fundraiser.rewardCatalogIds.length }} reward{{ fundraiser.rewardCatalogIds.length !== 1 ? 's' : '' }}
            </span>
          </UTooltip>
          <UTooltip v-if="activeRedeems > 0" text="Redeems currently in progress">
            <span class="inline-flex items-center gap-1">
              <UIcon name="i-lucide-trophy" class="size-3" />
              {{ activeRedeems }} active
            </span>
          </UTooltip>
        </div>
      </template>
    </UCard>
  </NuxtLink>
</template>
