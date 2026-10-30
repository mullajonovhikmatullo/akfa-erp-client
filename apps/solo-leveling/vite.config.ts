import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const appSrc = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  base: process.env.VITE_APP_BASE_PATH ?? '/',
  plugins: [tailwindcss(), react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [{ find: /^@\//, replacement: `${appSrc}/` }],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('node_modules/three') ? 'three' : undefined),
      },
    },
  },
  server: {
    port: 5176,
    strictPort: false,
  },
})
