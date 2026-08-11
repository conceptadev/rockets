import { spawnSync } from 'node:child_process';

// Local opt-out for machines without Java 21; CI never skips.
if (process.env.SKIP_EMULATOR && !process.env.CI) {
  console.warn(
    '!! Firestore emulator suite SKIPPED (SKIP_EMULATOR is set). ' +
      'CI always runs it; unset SKIP_EMULATOR to run locally.',
  );
  process.exit(0);
}

// firebase-tools is intentionally not a workspace dependency — the pinned
// npx invocation is the single place that names its version.
const result = spawnSync(
  'npx',
  [
    '--yes',
    'firebase-tools@15.15.0',
    'emulators:exec',
    '--only',
    'firestore',
    '--project',
    'demo-rockets',
    '--config',
    'firebase.json',
    './node_modules/.bin/vitest run --config vitest.firestore.config.mts',
  ],
  { stdio: 'inherit' },
);
process.exit(result.status ?? 1);
