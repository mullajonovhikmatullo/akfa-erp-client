import { fileURLToPath, URL } from 'node:url'

export default {
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@store/store-shared'],
    },
  },
}
