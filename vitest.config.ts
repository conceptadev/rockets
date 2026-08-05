import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // Vitest's default esbuild transform does not emit decorator metadata,
    // which Nest DI requires; SWC does when configured below.
    swc.vite({
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
        target: 'es2021',
      },
      module: { type: 'es6' },
    }),
  ],
  test: {
    globals: false,
    environment: 'node',
    pool: 'forks',
    include: ['packages/**/*.spec.ts'],
    exclude: ['**/*.e2e-spec.ts', '**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      // Same directory Jest used — CI uploads coverage/lcov.info and
      // coverage/coverage-final.json to Codecov/Codacy by these paths.
      reportsDirectory: 'coverage',
      reporter: ['text', 'text-summary', 'json', 'json-summary', 'lcovonly'],
      thresholds: {
        branches: 50,
        functions: 40,
        lines: 50,
        statements: 50,
      },
      include: ['packages/**/*.ts'],
      exclude: [
        '**/*.d.ts',
        '**/*.interface.ts',
        '**/*.spec.ts',
        '**/*.e2e-spec.ts',
        '**/*.factory.ts',
        '**/*.seeder.ts',
        '**/*.seeding.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/__mocks__/**',
        '**/__stubs__/**',
        '**/__fixtures__/**',
      ],
    },
  },
});
