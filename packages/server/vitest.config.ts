import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@artifacts/shared': fileURLToPath(new URL('../shared/src/index.ts', import.meta.url)),
      '@generated': fileURLToPath(new URL('./generated-src', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
