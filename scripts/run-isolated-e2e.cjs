#!/usr/bin/env node
/**
 * Runs each `*.e2e-spec.ts` file in its OWN process, N at a time.
 *
 * WHY (measured, not assumed): these suites each boot a full Nest + TypeORM
 * app. Sharing one Jest worker (`maxWorkers: 1`) they fail ~25% of full runs
 * — 2 of 8 — always with an unexpected 404, always in a different suite
 * (Jest reorders by cached duration, so the victim rotates). Every victim is
 * 100% green in isolation (10/10, 6/6). It is NOT leaked apps (every suite
 * closes in `afterEach`), NOT libuv threadpool starvation
 * (`UV_THREADPOOL_SIZE=64` → 1/8, no signal), and NOT a two-file pair
 * (persistence → define-resource → 0/10). What is left is cumulative
 * process state across ~30 app boots.
 *
 * This is a TEST-ONLY concern — a real app boots once per process — and one
 * process per file is the same isolation boundary Vitest gives natively via
 * `pool: 'forks'` + `isolate: true`. This script is the bridge until that
 * migration lands; it should be DELETED then, not ported.
 *
 * It also lets `forceExit` stay off: a suite that leaks a handle now hangs
 * its own process and gets reported instead of poisoning whichever suite
 * runs next.
 *
 * Discovery delegates to `jest --listTests`, so the config's `roots` /
 * `testRegex` / `testPathIgnorePatterns` remain the single source of truth.
 *
 * Usage: node scripts/run-isolated-e2e.cjs <jest-config> [extra jest args]
 * Env:   E2E_CONCURRENCY=<n>  (default: cpus - 1, capped at 8)
 */
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const config = process.argv[2] || 'jest-e2e.config.json';
const extraArgs = process.argv.slice(3);
const jestBin = require.resolve('jest/bin/jest');

// Capped at 4: at cpus-1 (7 locally) the parallel app boots contend for
// CPU hard enough to produce load-induced timing failures inside suites
// that are 10/10 green alone. 4 keeps the run ~2x faster than serial
// without hitting that. Override with E2E_CONCURRENCY.
const concurrency = Math.max(
  1,
  Number(process.env.E2E_CONCURRENCY) ||
    Math.min(4, Math.max(1, os.cpus().length - 1)),
);

// One process per file means each would otherwise overwrite the previous
// run's coverage, so collect a raw `json` report per file and merge them
// into the report set the config actually asks for.
const withCoverage = extraArgs.includes('--coverage');
const configJson = JSON.parse(fs.readFileSync(config, 'utf8'));
const coverageDir = path.resolve(configJson.coverageDirectory ?? 'coverage');
const partsDir = path.join(coverageDir, '.parts');

const listed = spawnSync(
  process.execPath,
  [jestBin, '--config', config, '--listTests'],
  { encoding: 'utf8' },
);

if (listed.status !== 0) {
  console.error(listed.stderr || `jest --listTests failed for ${config}`);
  process.exit(1);
}

const files = listed.stdout
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0)
  .sort();

if (files.length === 0) {
  console.error(`No e2e spec files matched by ${config}`);
  process.exit(1);
}

if (withCoverage) {
  fs.rmSync(partsDir, { recursive: true, force: true });
  fs.mkdirSync(partsDir, { recursive: true });
}

function coverageArgsFor(index) {
  if (!withCoverage) return [];
  return [
    `--coverageDirectory=${path.join(partsDir, String(index))}`,
    '--coverageReporters=json',
  ];
}

function runOne(file, index) {
  const rel = path.relative(process.cwd(), file);
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [
        jestBin,
        '--config',
        config,
        '--runInBand',
        ...coverageArgsFor(index),
        ...extraArgs,
        file,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let output = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (output += chunk));
    child.on('close', (code) => {
      // Buffered, not inherited: with N children interleaving, streamed
      // output would be unreadable. Printed whole, per suite, on completion.
      process.stdout.write(`\n── ${rel} ──\n${output}`);
      resolve({ rel, ok: code === 0 });
    });
  });
}

async function runAll() {
  const results = [];
  let next = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, files.length) },
    async () => {
      for (;;) {
        const index = next++;
        if (index >= files.length) return;
        results.push(await runOne(files[index], index));
      }
    },
  );
  await Promise.all(workers);
  return results;
}

function mergeCoverage() {
  const libCoverage = require('istanbul-lib-coverage');
  const libReport = require('istanbul-lib-report');
  const reports = require('istanbul-reports');

  const map = libCoverage.createCoverageMap({});
  let merged = 0;
  for (const entry of fs.readdirSync(partsDir)) {
    const file = path.join(partsDir, entry, 'coverage-final.json');
    if (!fs.existsSync(file)) continue;
    map.merge(JSON.parse(fs.readFileSync(file, 'utf8')));
    merged += 1;
  }

  if (merged === 0) {
    console.error('No per-suite coverage was produced — nothing to merge.');
    process.exit(1);
  }

  const context = libReport.createContext({
    dir: coverageDir,
    coverageMap: map,
  });
  for (const reporter of configJson.coverageReporters ?? ['text-summary']) {
    reports.create(reporter).execute(context);
  }
  fs.rmSync(partsDir, { recursive: true, force: true });
  console.log(`\nMerged coverage from ${merged} suite(s) into ${coverageDir}`);
}

runAll().then((results) => {
  const failed = results.filter((r) => !r.ok).map((r) => r.rel);
  if (failed.length > 0) {
    console.error(
      `\n${failed.length} e2e suite(s) failed:\n  ${failed.join('\n  ')}`,
    );
    process.exit(1);
  }
  console.log(
    `\nAll ${files.length} e2e suites passed ` +
      `(isolated processes, ${concurrency} at a time).`,
  );
  if (withCoverage) mergeCoverage();
});
