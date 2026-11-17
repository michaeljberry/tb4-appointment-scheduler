import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests-public/setup.ts',
    globals: true,
    include: ['tests-public/**/*.test.tsx'],
    fileParallelism: false,
  },
})
