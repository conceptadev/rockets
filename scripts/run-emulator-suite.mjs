import { spawnSync } from 'node:child_process';

// Local opt-out for machines without Java 21; CI never skips.
if (process.env.SKIP_EMULATOR && !process.env.CI) {
  console.warn(
    '!! Firestore emulator suite SKIPPED (SKIP_EMULATOR is set). ' +
      'CI always runs it; unset SKIP_EMULATOR to run locally.',
  );
  process.exit(0);
}

function assertJdk21OrNewer() {
  const result = spawnSync('java', ['-version'], { encoding: 'utf8' });
  const output = `${result.stderr ?? ''}${result.stdout ?? ''}`;
  const match = /version "(\d+)/.exec(output);
  const major = match ? Number(match[1]) : Number.NaN;
  if (!Number.isFinite(major) || major < 21) {
    console.error(
      'Firestore emulator requires JDK 21+ (firebase-tools). ' +
        `Detected: ${match ? `Java ${major}` : 'no usable java -version'}.\n` +
        'Install a modern JDK (e.g. `brew install openjdk@21`) and ensure ' +
        '`java -version` reports 21+, or set SKIP_EMULATOR=1 locally ' +
        '(CI never skips).',
    );
    process.exit(1);
  }
}

assertJdk21OrNewer();

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
