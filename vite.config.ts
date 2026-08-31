import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  envPrefix: ['VITE_', 'API_'],
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@test-fixtures': fileURLToPath(new URL('./test-fixtures', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
