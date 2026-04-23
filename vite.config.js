import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Avantage Plus — F&I Prestige',
        short_name: 'Avantage+',
        description: 'Plateforme F&I prestige · Présentations véhicules signature.',
        theme_color: '#0E0E11',
        background_color: '#F7F4EE',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/',
        scope: '/',
        lang: 'fr-CA',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        maximumFileSizeToCacheInBytes: 5_000_000,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [
          /^\/__\//, /^\/google\//, /^\/identitytoolkit/, /^\/firestore/, /^\/v1\//,
        ],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'cdn.imagin.studio',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'vehicle-images',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Ne jamais mettre en cache les API Firebase (auth/firestore/rtdb).
            urlPattern: ({ url }) =>
              url.hostname.endsWith('.googleapis.com') ||
              url.hostname.endsWith('.firebaseio.com') ||
              url.hostname.endsWith('.firebasedatabase.app') ||
              url.hostname.endsWith('.cloudfunctions.net'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('firebase')) return 'firebase-vendor';
          if (id.includes('@radix-ui') || id.includes('cmdk')) return 'ui-vendor';
          if (id.includes('react-router') || id.includes('/react-dom/') || /node_modules\/react\//.test(id)) return 'react-vendor';
          return undefined;
        },
      },
    },
  },
})
