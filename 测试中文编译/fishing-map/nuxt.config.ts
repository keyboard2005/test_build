// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: '钓鱼佬地图',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no'
        }
      ]
    }
  },
  devServer: {
    host: '0.0.0.0',
    https: {
      key: './localhost+3-key.pem',
      cert: './localhost+3.pem'
    }
  },
  runtimeConfig: {
    public: {
      forceLocation: process.env.NUXT_FORCE_LOCATION === 'true',
      forceLatitude: process.env.NUXT_FORCE_LATITUDE,
      forceLongitude: process.env.NUXT_FORCE_LONGITUDE,
      tencentMapKey: process.env.NUXT_TENCENT_MAP_KEY || 'YOUR_TENCENT_MAP_KEY',
      tiandituKey: process.env.NUXT_TIANDITU_KEY || 'YOUR_TIANDITU_KEY'
    }
  }
})