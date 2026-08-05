import { defineProject, mergeConfig } from 'vitest/config';
import shared from '../../vitest.shared';

/**
 * E2E project for the sample-server example — registered in the root
 * `vitest.config.ts` `projects` list and runnable standalone via
 * `--config` from the workspace.
 */
export default mergeConfig(
  shared,
  defineProject({
  test: {
    name: 'e2e-sample-server',
    sequence: { groupOrder: 2 },
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // The Jest setup ran one spec file at a time (maxWorkers: 1 via the
    // isolated runner); keep the same sequential behavior.
    maxWorkers: 1,
    include: ['test/**/*.e2e-spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
}),
);
