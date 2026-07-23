import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const appSrc = fileURLToPath(new URL('./src', import.meta.url))
const landingViewEntry = fileURLToPath(new URL('../../dramas/landing-view/src/index.ts', import.meta.url))

export default defineConfig({
  base: '/',
  envDir: fileURLToPath(new URL('../..', import.meta.url)),
  plugins: [tailwindcss(), react(), tsconfigPaths()],
  publicDir: fileURLToPath(new URL('../../shared-public', import.meta.url)),
  resolve: {
    preserveSymlinks: false,
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: /^@erp\/landing-view$/, replacement: landingViewEntry },
      { find: /^@\//, replacement: `${appSrc}/` },
    ],
  },
  server: {
    port: 5174,
    strictPort: false,
  },
})
