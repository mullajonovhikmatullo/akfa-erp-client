import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

const entry = fileURLToPath(new URL('./src/index.ts', import.meta.url))
const externalPackages = ['i18next', 'react', 'react-i18next']
const isExternal = (id: string) =>
  externalPackages.some((packageName) => id === packageName || id.startsWith(`${packageName}/`))

export default defineConfig({
  build: {
    lib: {
      entry,
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: isExternal,
    },
  },
})
