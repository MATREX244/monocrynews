import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'logo-192.png', 'logo-512.png', 'robots.txt'],
      manifest: {
        name: 'Monocry — Crypto News & Markets',
        short_name: 'Monocry',
        description: 'Latest cryptocurrency news, market analysis, price predictions and deep dives.',
        theme_color: '#0079C1',
        background_color: '#111111',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/favicon.png', sizes: '64x64', type: 'image/png' },
          { src: '/logo-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ],
        categories: ['news', 'finance', 'business']
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/plmkbqfsydhbijijapgo\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 300 }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|webp|gif|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 * 30 }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
})
