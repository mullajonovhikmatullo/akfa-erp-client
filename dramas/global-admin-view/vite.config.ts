import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const entry = (path: string) => fileURLToPath(new URL(path, import.meta.url));

const externalPackages = [
  '@phosphor-icons/react',
  '@tanstack/react-query',
  'antd',
  'clsx',
  'dayjs',
  'react',
  'recharts',
  'sonner',
];

const isExternal = (id: string) =>
  externalPackages.some((pkg) => id === pkg || id.startsWith(`${pkg}/`));

export default defineConfig({
  build: {
    assetsDir: 'assets',
    lib: {
      entry: {
        index: entry('./src/index.ts'),
        dashboard: entry('./src/components/dashboard/index.ts'),
        'coming-soon': entry('./src/components/coming-soon/index.ts'),
        mocks: entry('./src/mocks/index.ts'),
        types: entry('./src/types/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: isExternal,
    },
  },
});
