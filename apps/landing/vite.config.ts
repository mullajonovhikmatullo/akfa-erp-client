import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const appSrc = fileURLToPath(new URL('./src', import.meta.url))
const landingStubEntry = fileURLToPath(new URL('../../dramas/landing-stub/src/index.ts', import.meta.url))
const landingViewEntry = fileURLToPath(new URL('../../dramas/landing-view/src/index.ts', import.meta.url))

export default defineConfig({
  base: '/',
  envDir: fileURLToPath(new URL('../..', import.meta.url)),
  plugins: [tailwindcss(), react()],
  publicDir: fileURLToPath(new URL('../../shared-public', import.meta.url)),
  resolve: {
    tsconfigPaths: true,
    preserveSymlinks: false,
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: /^@store\/landing-stub$/, replacement: landingStubEntry },
      { find: /^@store\/landing-view$/, replacement: landingViewEntry },
      { find: /^@\//, replacement: `${appSrc}/` },
    ],
  },
  server: {
    port: 5174,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
