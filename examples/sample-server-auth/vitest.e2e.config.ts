import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

/**
 * E2E runner for the sample-server-auth example. Mirrors the root
 * `vitest.e2e.config.ts`. The former Jest `moduleNameMapper` entries are not
 * ported: workspace packages (`@conceptadev/*`) resolve to their built `dist`
 * through normal node resolution, and the `@nestjs/*` / `@concepta/*` /
 * `typeorm` mappings only replicated hoisting that node resolution already
 * provides.
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
    include: ['test/**/*.e2e-spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
