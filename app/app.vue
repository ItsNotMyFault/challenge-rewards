<script setup lang="ts">
// Force light mode — no dark theme
const colorMode = useColorMode();
colorMode.preference = "light";

// Ensure html element doesn't have dark class
onMounted(() => {
  if (process.client) {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-color-mode", "light");
    document.documentElement.setAttribute("style", "color-scheme: light;");
  }
});
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
