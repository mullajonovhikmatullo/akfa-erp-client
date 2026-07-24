import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

const packageNamePattern = /\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)/
const storeSharedEntry = fileURLToPath(new URL('../../dramas/store-shared/src/index.ts', import.meta.url))
const platformStubEntry = fileURLToPath(new URL('../../dramas/platform-stub/src/index.ts', import.meta.url))

function getPackageName(id: string) {
  return id.match(packageNamePattern)?.[1]
}

function vendorChunkName(packageName: string) {
  return `vendor-${packageName.replace(/^@/, '').replace(/[/.]/g, '-')}`
}

export default defineConfig({
  base: '/platform/',
  envDir: fileURLToPath(new URL('../..', import.meta.url)),
  plugins: [react(), tsconfigPaths()],
  publicDir: fileURLToPath(new URL('../../shared-public', import.meta.url)),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const moduleId = id.replace(/\\/g, '/')

          if (!moduleId.includes('/node_modules/')) {
            return
          }

          const packageName = getPackageName(moduleId)

          if (!packageName) {
            return 'vendor'
          }

          if (packageName === 'react-dom') {
            return 'vendor-react-dom'
          }

          if (packageName === 'react' || packageName === 'scheduler') {
            return 'vendor-react'
          }

          if (packageName === 'recharts' || packageName.startsWith('d3-')) {
            return 'vendor-charts'
          }

          if (packageName === '@phosphor-icons/react' || packageName === '@ant-design/icons') {
            return 'vendor-icons'
          }

          if (packageName === '@tanstack/react-query') {
            return 'vendor-query'
          }

          if (packageName === 'dayjs') {
            return 'vendor-date'
          }

          if (packageName === 'sonner') {
            return 'vendor-feedback'
          }

          if (packageName === 'react-router' || packageName === 'react-router-dom' || packageName === 'zustand') {
            return 'vendor-router-state'
          }

          if (packageName === 'antd') {
            if (
              moduleId.includes('/antd/es/button/') ||
              moduleId.includes('/antd/es/input/') ||
              moduleId.includes('/antd/es/switch/')
            ) {
              return 'vendor-antd-controls'
            }

            if (
              moduleId.includes('/antd/es/avatar/') ||
              moduleId.includes('/antd/es/badge/') ||
              moduleId.includes('/antd/es/dropdown/') ||
              moduleId.includes('/antd/es/popover/') ||
              moduleId.includes('/antd/es/skeleton/') ||
              moduleId.includes('/antd/es/tooltip/')
            ) {
              return 'vendor-antd-overlays'
            }

            return 'vendor-antd-core'
          }

          return vendorChunkName(packageName)
        },
      },
    },
  },
  resolve: {
    preserveSymlinks: false,
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@store/store-shared': storeSharedEntry,
      '@store/platform-stub': platformStubEntry,
    },
  },
  server: {
    port: 5175,
    strictPort: false,
  },
})
