import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const entry = (path: string) => fileURLToPath(new URL(path, import.meta.url));

const externalPackages = ['lucide-react', 'react'];

const isExternal = (id: string) =>
  externalPackages.some((pkg) => id === pkg || id.startsWith(`${pkg}/`));

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: entry('./src/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: isExternal,
    },
  },
});
