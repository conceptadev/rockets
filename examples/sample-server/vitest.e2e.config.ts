import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

/**
 * E2E runner for the sample-server example. Mirrors the root
 * `vitest.e2e.config.ts`: `pool: 'forks'` gives each spec file a fresh
 * process, which Jest needed a hand-rolled runner to achieve here.
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
    // The Jest setup ran one spec file at a time (maxWorkers: 1 via the
    // isolated runner); keep the same sequential behavior.
    maxWorkers: 1,
    include: ['test/**/*.e2e-spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
