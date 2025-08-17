// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true
  },
  nitro: {
    experimental: {
      wasm: true
    }
  },
  experimental: {
    payloadExtraction: false
  },

  devServer: {
    host: '0.0.0.0', // Permite conexiones externas
    port: 3000
  }
})