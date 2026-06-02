import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/SWCore_internship2/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'SWCore Internship',
        short_name: 'SWCore',
        description: 'SW중심대학 인턴십 신청·매칭·관리 PWA',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/SWCore_internship2/',
        scope: '/SWCore_internship2/',
        icons: [
          {
            src: '/SWCore_internship2/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/SWCore_internship2/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
