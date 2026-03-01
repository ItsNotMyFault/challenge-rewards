<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { loggedIn, user, clear: logout } = useUserSession()
const eventsStore = useEventsStore()

// Fetch events for nav dropdown (non-blocking)
callOnce(() => eventsStore.fetchEvents())

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Challenges',
    icon: 'i-lucide-git-branch',
    to: '/challenges',
  },
  {
    label: 'Events',
    icon: 'i-lucide-calendar-heart',
    to: '/events',
    children: [
      ...eventsStore.events.map(e => ({
        label: e.name,
        icon: e.status === 'active' ? 'i-lucide-radio' : e.status === 'completed' ? 'i-lucide-check-circle' : 'i-lucide-pencil',
        to: `/events/${e.id}`,
      })),
      ...(eventsStore.events.length > 0
        ? [{ label: '', icon: '', disabled: true } as any]
        : []),
      {
        label: 'All Events',
        icon: 'i-lucide-list',
        to: '/events',
      },
    ],
  },
  {
    label: 'Redeems',
    icon: 'i-lucide-trophy',
    to: '/redeems',
  },
])
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden">
    <header class="relative z-50 h-14 shrink-0 border-b border-[var(--ui-border)] bg-[var(--ui-bg)]/80 backdrop-blur-lg">
      <div class="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-trophy" class="size-5 text-[var(--ui-primary)]" />
          <span class="text-base font-bold tracking-tight">Reward Tracker</span>
        </div>

        <UNavigationMenu
          :items="navItems"
          highlight
          highlight-color="primary"
          content-orientation="vertical"
        />

        <div class="flex items-center gap-2">
          <UColorModeButton size="sm" />

          <template v-if="loggedIn && user">
            <UDropdownMenu
              :items="[
                [{
                  label: user.name,
                  icon: 'i-lucide-user',
                  disabled: true,
                }],
                ...(user.isAdmin ? [[{
                  label: 'Admin',
                  icon: 'i-lucide-shield',
                  disabled: true,
                }]] : []),
                [{
                  label: 'Sign out',
                  icon: 'i-lucide-log-out',
                  onSelect: () => logout(),
                }],
              ]"
            >
              <UButton color="neutral" variant="ghost" size="sm">
                <UAvatar
                  :src="user.avatarUrl ?? undefined"
                  :alt="user.name"
                  size="2xs"
                />
              </UButton>
            </UDropdownMenu>
          </template>

          <UButton
            v-else
            to="/login"
            icon="i-lucide-log-in"
            label="Sign in"
            color="neutral"
            variant="ghost"
            size="sm"
          />
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-hidden">
      <slot />
    </main>
  </div>
</template>
