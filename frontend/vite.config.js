import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Postres Juli",
        short_name: "Postres",
        description: "Sistema de control de ventas y gastos",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-192.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
})