import { defineConfig, mergeConfig } from 'vitest/config';

import shared from './vitest.shared.mts';

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      name: 'firestore-emulator',
      include: ['packages/**/*.emulator-spec.ts'],
      testTimeout: 30_000,
      hookTimeout: 30_000,
      maxWorkers: 1,
    },
  }),
);
