import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

const entry = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const externalPackages = [
  '@phosphor-icons/react',
  'antd',
  'axios',
  'clsx',
  'dayjs',
  'react',
  'sonner',
  'xlsx',
]

const isExternal = (id: string) =>
  externalPackages.some((pkg) => id === pkg || id.startsWith(`${pkg}/`))

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: entry('./src/index.ts'),
        api: entry('./src/api/index.ts'),
        core: entry('./src/core/index.ts'),
        lib: entry('./src/lib/index.ts'),
        ui: entry('./src/ui/index.ts'),
        'lib/autofill': entry('./src/lib/autofill.ts'),
        'lib/formatters': entry('./src/lib/formatters.ts'),
        'lib/parse-excel': entry('./src/lib/parseExcel.ts'),
        'lib/product-pricing': entry('./src/lib/productPricing.ts'),
        'ui/app-modal': entry('./src/ui/AppModal/AppModal.tsx'),
        'ui/branch-name': entry('./src/ui/BranchName/BranchName.tsx'),
        'ui/data-table': entry('./src/ui/DataTable/DataTable.tsx'),
        'ui/ellipsis-text': entry('./src/ui/EllipsisText/EllipsisText.tsx'),
        'ui/excel-import-button': entry('./src/ui/ExcelImportButton/ExcelImportButton.tsx'),
        'ui/money-display': entry('./src/ui/MoneyDisplay/MoneyDisplay.tsx'),
        'ui/select-loading-content': entry('./src/ui/SelectLoadingContent/SelectLoadingContent.tsx'),
        'ui/status-badge': entry('./src/ui/StatusBadge/StatusBadge.tsx'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: isExternal,
    },
  },
})
