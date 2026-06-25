import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }]
    }
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      globals: {
        clearTimeout: 'readonly',
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly'
      }
    }
  },
  {
    ignores: ['dist/**', 'packages/*/dist/**', 'apps/*/dist/**', '**/*.d.ts', 'coverage/**', 'node_modules/**', '.hardening/**', 'artifacts/benchmark-runs/**', 'artifacts/test-results/**', 'benchmark-runs/**', 'test-results/**']
  }
);
