import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup.tsx'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
})
