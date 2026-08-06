import { defineConfig, mergeConfig } from 'vitest/config';
import shared from './vitest.shared';

/**
 * Root config: declares every test project (Vitest 4 `projects` model).
 * Select with `--project <name>` (globs allowed: `--project 'e2e-*'`);
 * a bare `vitest run` executes everything, which expects `yarn build`
 * to have run first (e2e resolves workspace packages from dist).
 *
 * `coverage` and `reporters` are root-only by design — projects share
 * the run's coverage instance. The coverage directory is overridden per
 * CI step (`--coverage.reportsDirectory=coverage-e2e` on the e2e step)
 * so Codecov/Codacy keep their historical upload paths.
 */
export default defineConfig({
  test: {
    projects: [
      mergeConfig(shared, {
        test: {
          name: 'unit',
          // groupOrder sequences project groups in a full `vitest run`;
          // projects with different maxWorkers must not share a group.
          sequence: { groupOrder: 0 },
          include: ['packages/**/*.spec.ts'],
          exclude: ['**/*.e2e-spec.ts', '**/node_modules/**', '**/dist/**'],
        },
      }),
      mergeConfig(shared, {
        test: {
          name: 'e2e-packages',
          sequence: { groupOrder: 1 },
          include: ['packages/**/*.e2e-spec.ts'],
          exclude: ['**/node_modules/**', '**/dist/**'],
          testTimeout: 30_000,
          hookTimeout: 30_000,
          // 4 parallel app boots is the sweet spot for plain runs; at
          // cpus-1 the boots contend for CPU hard enough to produce
          // load-induced timing failures. The coverage script overrides
          // this to 1: instrumented boots are heavier, and serial
          // execution removes every cross-process variable while the
          // rotating-404 flake (CHANGELOG "Known flaky failure") is
          // under investigation.
          maxWorkers: 4,
        },
      }),
      'examples/sample-server/vitest.e2e.config.ts',
      'examples/sample-server-auth/vitest.e2e.config.ts',
      'examples/sample-code-review/apps/api/vitest.e2e.config.ts',
    ],
    coverage: {
      provider: 'v8',
      // Same directory Jest used — CI uploads coverage/lcov.info and
      // coverage/coverage-final.json to Codecov/Codacy by these paths.
      reportsDirectory: 'coverage',
      reporter: ['text', 'text-summary', 'json', 'json-summary', 'lcov'],
      // Thresholds are a PER-RUN policy, not a config constant: the unit
      // gate asserts 50/40/50/50 via CLI flags in `test:ci`/`test:cov`,
      // while the e2e coverage run (historically threshold-free) only
      // reports. Coverage config is root-only under the projects model,
      // so this is the one place the two runs can diverge.
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
