import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

const entry = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const externalPackages = [
  '@store/store-i18n',
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
        admins: entry('./src/components/store/admins/index.ts'),
        analytics: entry('./src/components/store/analytics/index.ts'),
        auth: entry('./src/components/store/auth/index.ts'),
        branch: entry('./src/components/store/branch/index.ts'),
        billing: entry('./src/components/store/billing/index.ts'),
        category: entry('./src/components/store/category/index.ts'),
        customer: entry('./src/components/store/customer/index.ts'),
        dashboard: entry('./src/components/store/dashboard/index.ts'),
        expense: entry('./src/components/store/expense/index.ts'),
        inventory: entry('./src/components/store/inventory/index.ts'),
        product: entry('./src/components/store/product/index.ts'),
        profile: entry('./src/components/store/profile/index.ts'),
        purchase: entry('./src/components/store/purchase/index.ts'),
        sale: entry('./src/components/store/sale/index.ts'),
        settings: entry('./src/components/store/settings/index.ts'),
        transfer: entry('./src/components/store/transfer/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: isExternal,
    },
  },
})
