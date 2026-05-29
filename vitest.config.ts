import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts']
  },
  resolve: {
    alias: {
      '@/src/lib/calculators': fileURLToPath(new URL('./src/lib/calculators/index.ts', import.meta.url)),
      '@': root
    }
  }
});
