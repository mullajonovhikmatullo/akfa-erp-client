import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const packageNamePattern = /\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)/
const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url))
const storeSharedEntry = fileURLToPath(new URL('../../dramas/store-shared/src/api/index.ts', import.meta.url))
const platformStubEntry = fileURLToPath(new URL('../../dramas/platform-stub/src/index.ts', import.meta.url))

function getPackageName(id: string) {
  return id.match(packageNamePattern)?.[1]
}

function vendorChunkName(packageName: string) {
  return `vendor-${packageName.replace(/^@/, '').replace(/[/.]/g, '-')}`
}

export default defineConfig(({ mode }) => {
  //
  const env = loadEnv(mode, workspaceRoot, '')
  const base = env.VITE_APP_BASE_PATH || (env.VERCEL === '1' ? '/' : '/platform/')

  return {
    base,
    envDir: workspaceRoot,
    plugins: [react(), tailwindcss(), tsconfigPaths()],
    publicDir: fileURLToPath(new URL('../../shared-public', import.meta.url)),
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const moduleId = id.replace(/\\/g, '/')
            if (!moduleId.includes('/node_modules/')) return
            const packageName = getPackageName(moduleId)
            if (!packageName) return 'vendor'
            if (packageName === 'react' || packageName === 'react-dom' || packageName === 'scheduler') return 'vendor-react'
            if (packageName === 'radix-ui' || packageName.startsWith('@radix-ui/') || packageName === 'cmdk') return 'vendor-ui'
            if (packageName === 'lucide-react') return 'vendor-icons'
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
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    },
  }
})
