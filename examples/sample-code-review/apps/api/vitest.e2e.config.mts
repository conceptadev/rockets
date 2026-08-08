import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineProject, mergeConfig } from 'vitest/config';
import shared from '../../../../vitest.shared.mts';

/**
 * E2E project for the sample-code-review API — registered in the root
 * `vitest.config.mts` `projects` list and runnable standalone via
 * `--config` from the workspace. The Jest `moduleNameMapper` stub swap (real
 * Firestore persistence -> in-memory backend stub) is ported as a regex
 * alias below.
 */
export default mergeConfig(
  shared,
  defineProject({
  resolve: {
    alias: [
      {
        // Redirect the analysis module's relative import of the real
        // Firestore persistence to the in-memory test stub (was Jest's
        // moduleNameMapper).
        find: /^\.\.\/repository\/code-review-reports\.persistence$/,
        replacement: path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          'test/stubs/code-review-reports.persistence.stub.ts',
        ),
      },
    ],
  },
  test: {
    name: 'e2e-sample-code-review',
    sequence: { groupOrder: 4 },
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // The Jest config ran with maxWorkers: 1; keep sequential execution.
    maxWorkers: 1,
    setupFiles: ['./test/setup-env.ts'],
    include: ['test/**/*.e2e-spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
}),
);
