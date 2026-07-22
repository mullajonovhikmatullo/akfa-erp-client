import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  base: '/',
  envDir: fileURLToPath(new URL('../..', import.meta.url)),
  plugins: [react(), tsconfigPaths()],
  publicDir: fileURLToPath(new URL('../../shared-public', import.meta.url)),
  resolve: {
    preserveSymlinks: false,
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5174,
    strictPort: false,
  },
})
