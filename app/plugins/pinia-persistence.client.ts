import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = nuxtApp.$pinia as import('pinia').Pinia
  pinia.use(piniaPluginPersistedstate)
})
