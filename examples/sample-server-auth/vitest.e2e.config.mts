import { defineProject, mergeConfig } from 'vitest/config';
import shared from '../../vitest.shared.mts';

/**
 * E2E project for the sample-server-auth example — registered in the root
 * `vitest.config.mts` `projects` list and runnable standalone via
 * `--config` from the workspace. The former Jest `moduleNameMapper`
 * entries are not ported: workspace packages (`@concepta/*`) resolve to their built `dist`
 * through normal node resolution, and the `@nestjs/*` / `@concepta/*` /
 * `typeorm` mappings only replicated hoisting that node resolution already
 * provides.
 */
export default mergeConfig(
  shared,
  defineProject({
  test: {
    name: 'e2e-sample-server-auth',
    sequence: { groupOrder: 3 },
    testTimeout: 30_000,
    hookTimeout: 30_000,
    include: ['test/**/*.e2e-spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
}),
);
