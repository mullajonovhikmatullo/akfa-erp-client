import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

const packageNamePattern = /\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)/

function getPackageName(id: string) {
  return id.match(packageNamePattern)?.[1]
}

function vendorChunkName(packageName: string) {
  return `vendor-${packageName.replace(/^@/, '').replace(/[/.]/g, '-')}`
}

export default defineConfig({
  envDir: fileURLToPath(new URL('../..', import.meta.url)),
  plugins: [react(), tsconfigPaths()],
  publicDir: fileURLToPath(new URL('../../shared-public', import.meta.url)),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const moduleId = id.replace(/\\/g, '/')

          if (moduleId.includes('/node_modules/')) {
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

            if (
              packageName === '@rc-component/picker' ||
              packageName === 'dayjs' ||
              moduleId.includes('/antd/es/date-picker/') ||
              moduleId.includes('/antd/es/calendar/') ||
              moduleId.includes('/antd/es/time-picker/')
            ) {
              return 'vendor-date'
            }

            if (packageName === '@rc-component/table' || moduleId.includes('/antd/es/table/')) {
              return 'vendor-table'
            }

            if (packageName === '@rc-component/select' || moduleId.includes('/antd/es/select/')) {
              return 'vendor-select'
            }

            if (
              packageName === 'react-hook-form' ||
              packageName === '@hookform/resolvers' ||
              packageName === 'zod'
            ) {
              return 'vendor-forms'
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

            if (packageName === 'axios') {
              return 'vendor-http'
            }

            if (packageName === 'sonner') {
              return 'vendor-feedback'
            }

            if (packageName === 'react-router' || packageName === 'react-router-dom' || packageName === 'zustand') {
              return 'vendor-router-state'
            }

            if (packageName === 'xlsx' || packageName === 'cfb' || packageName === 'ssf') {
              return 'vendor-excel'
            }

            if (packageName === 'antd') {
              if (
                moduleId.includes('/antd/es/button/') ||
                moduleId.includes('/antd/es/input/') ||
                moduleId.includes('/antd/es/input-number/') ||
                moduleId.includes('/antd/es/radio/') ||
                moduleId.includes('/antd/es/segmented/') ||
                moduleId.includes('/antd/es/switch/') ||
                moduleId.includes('/antd/es/upload/')
              ) {
                return 'vendor-antd-controls'
              }

              if (
                moduleId.includes('/antd/es/alert/') ||
                moduleId.includes('/antd/es/badge/') ||
                moduleId.includes('/antd/es/drawer/') ||
                moduleId.includes('/antd/es/dropdown/') ||
                moduleId.includes('/antd/es/empty/') ||
                moduleId.includes('/antd/es/message/') ||
                moduleId.includes('/antd/es/modal/') ||
                moduleId.includes('/antd/es/popconfirm/') ||
                moduleId.includes('/antd/es/progress/') ||
                moduleId.includes('/antd/es/skeleton/') ||
                moduleId.includes('/antd/es/tag/') ||
                moduleId.includes('/antd/es/tooltip/')
              ) {
                return 'vendor-antd-overlays'
              }

              if (moduleId.includes('/antd/es/form/')) {
                return 'vendor-antd-form'
              }

              return 'vendor-antd-core'
            }

            return vendorChunkName(packageName)
          }
        },
      },
    },
  },
  resolve: {
    preserveSymlinks: false,
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
})
