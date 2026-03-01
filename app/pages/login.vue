<script setup lang="ts">
const { loggedIn } = useUserSession()

// Redirect if already logged in
if (loggedIn.value) {
  navigateTo('/events')
}
</script>

<template>
  <div class="flex h-full items-center justify-center">
    <div class="w-full max-w-sm space-y-6 text-center">
      <div>
        <UIcon name="i-lucide-trophy" class="mx-auto size-12 text-[var(--ui-primary)]" />
        <h1 class="mt-4 text-2xl font-bold">Sign in to Reward Tracker</h1>
        <p class="mt-2 text-sm text-[var(--ui-text-muted)]">
          Sign in with your Google account to join events as a fundraiser and manage your rewards.
        </p>
      </div>

      <UButton
        to="/auth/google"
        external
        icon="i-lucide-log-in"
        label="Sign in with Google"
        size="lg"
        block
      />

      <p class="text-xs text-[var(--ui-text-muted)]">
        You can browse events and fundraisers without signing in.
      </p>

      <UButton
        label="Back to Home"
        to="/"
        color="neutral"
        variant="ghost"
        size="sm"
      />
    </div>
  </div>
</template>
