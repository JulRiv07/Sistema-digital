import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const BACKEND = "http://127.0.0.1:8000";

const API_PATHS = [
  "/login", "/logout", "/registro", "/me",
  "/auth", "/perfil", "/empresa",
  "/clientes", "/ventas", "/pagos", "/gastos",
  "/deudas", "/resumen", "/productos", "/health",
];

export default defineConfig({
  server: {
    proxy: Object.fromEntries(
      API_PATHS.map((path) => [path, { target: BACKEND, changeOrigin: true }])
    ),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Controla",
        short_name: "Controla",
        description: "Controla — gestión de ventas, pagos, gastos e inventario",
        theme_color: "#2563eb",
        background_color: "#1e3a8a",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ]
})