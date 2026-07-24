import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

const entry = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const externalPackages = [
  '@store/store-shared',
  '@store/store-stub',
  '@hookform/resolvers',
  '@phosphor-icons/react',
  '@tanstack/react-query',
  'antd',
  'dayjs',
  'react',
  'react-hook-form',
  'react-router-dom',
  'recharts',
  'sonner',
  'zod',
]

const isExternal = (id: string) =>
  externalPackages.some((pkg) => id === pkg || id.startsWith(`${pkg}/`))

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: entry('./src/index.ts'),
        admins: entry('./src/components/mgr/admins/index.ts'),
        analytics: entry('./src/components/mgr/analytics/index.ts'),
        auth: entry('./src/components/mgr/auth/index.ts'),
        branch: entry('./src/components/mgr/branch/index.ts'),
        category: entry('./src/components/mgr/category/index.ts'),
        customer: entry('./src/components/mgr/customer/index.ts'),
        dashboard: entry('./src/components/mgr/dashboard/index.ts'),
        expense: entry('./src/components/mgr/expense/index.ts'),
        inventory: entry('./src/components/mgr/inventory/index.ts'),
        product: entry('./src/components/mgr/product/index.ts'),
        profile: entry('./src/components/mgr/profile/index.ts'),
        purchase: entry('./src/components/mgr/purchase/index.ts'),
        sale: entry('./src/components/mgr/sale/index.ts'),
        settings: entry('./src/components/mgr/settings/index.ts'),
        transfer: entry('./src/components/mgr/transfer/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: isExternal,
    },
  },
})
