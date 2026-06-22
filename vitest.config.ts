import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    restoreMocks: true,
    clearMocks: true,
    exclude: [...configDefaults.exclude, 'packages/*/dist/**', 'artifacts/benchmark-runs/**', 'benchmark-runs/**'],
    coverage: {
      reporter: ['text', 'html']
    }
  }
});
