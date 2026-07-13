import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    fileParallelism: true,
    maxWorkers: 4,
    restoreMocks: true,
    clearMocks: true,
    exclude: [...configDefaults.exclude, 'packages/*/dist/**', 'apps/*/dist/**', 'artifacts/benchmark-runs/**', 'benchmark-runs/**'],
    coverage: {
      reporter: ['text', 'html']
    }
  }
});
