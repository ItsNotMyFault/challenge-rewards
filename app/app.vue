<script setup lang="ts">
// Force light mode — no dark theme
const colorMode = useColorMode()
colorMode.preference = 'light'
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
