import path from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

/**
 * E2E runner for the sample-code-review API. Mirrors the root
 * `vitest.e2e.config.ts`. The Jest `moduleNameMapper` stub swap (real
 * Firestore persistence -> in-memory backend stub) is ported as a regex
 * alias below.
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
  resolve: {
    alias: [
      {
        // Redirect the analysis module's relative import of the real
        // Firestore persistence to the in-memory test stub (was Jest's
        // moduleNameMapper).
        find: /^\.\.\/repository\/code-review-reports\.persistence$/,
        replacement: path.resolve(
          __dirname,
          'test/stubs/code-review-reports.persistence.stub.ts',
        ),
      },
    ],
  },
  test: {
    globals: false,
    environment: 'node',
    pool: 'forks',
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // The Jest config ran with maxWorkers: 1; keep sequential execution.
    maxWorkers: 1,
    setupFiles: ['./test/setup-env.ts'],
    include: ['test/**/*.e2e-spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
