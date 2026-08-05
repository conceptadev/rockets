import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

/**
 * E2E runner. `pool: 'forks'` runs every spec file in its own fresh
 * process — under Jest these suites shared one worker and flaked ~25% of
 * full runs from cumulative state across ~30 Nest + TypeORM app boots.
 */
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
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // 4 parallel app boots is the sweet spot for plain runs; at cpus-1 the
    // boots contend for CPU hard enough to produce load-induced timing
    // failures. The coverage script (`test:e2e:cov`) overrides this to 1:
    // instrumented boots are heavier, and serial execution also removes
    // every cross-process variable while the rotating-404 flake
    // (CHANGELOG "Known flaky failure") is under investigation.
    maxWorkers: 4,
    include: ['packages/**/*.e2e-spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage-e2e',
      // `json` included: CI uploads coverage-e2e/coverage-final.json.
      reporter: ['text', 'text-summary', 'lcov', 'json'],
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
