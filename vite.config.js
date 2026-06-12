import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Z-Services',
        short_name: 'Z-Services',
        description: 'Gestion des services hébergés à la maison',
        theme_color: '#121212',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      build: {
        overlay: true,
      },
    }),
  ],
  build: {
    outDir: 'dist',
    preview: {
      port: 4173,
      host: '0.0.0.0',
    },
  },
  server: {
    host: '0.0.0.0',
    port: 4173,
  },
})
