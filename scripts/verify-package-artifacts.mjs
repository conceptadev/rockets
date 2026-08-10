import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packagesRoot = join(repositoryRoot, 'packages');
const failures = [];
let checkedArtifacts = 0;

function fail(packageName, message) {
  failures.push(`${packageName}: ${message}`);
}

// The packed tarball is the only truth about what npm consumers receive.
// `--ignore-scripts` skips each package's prepack (clean + full rebuild);
// the release chain builds before this script runs.
function packedFilePaths(packageRoot) {
  const stdout = execFileSync(
    'npm',
    ['pack', '--dry-run', '--json', '--ignore-scripts'],
    { cwd: packageRoot, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
  );
  const [report] = JSON.parse(stdout);
  return new Set(report.files.map((file) => file.path));
}

function checkTarget(packageName, packedFiles, label, target) {
  if (typeof target !== 'string') return;
  const normalized = target.replace(/^\.\//, '');
  // npm pack always includes the `main`/`browser` file, even from src/ —
  // tarball membership alone cannot catch a source entry point.
  if (normalized.startsWith('src/') || normalized.includes('/src/')) {
    fail(packageName, `${label} points at unpublished source: ${target}`);
    return;
  }
  if (!packedFiles.has(normalized)) {
    fail(packageName, `${label} target is not in the packed tarball: ${target}`);
    return;
  }
  checkedArtifacts += 1;
}

function tarballIncludes(packedFiles, entry) {
  if (packedFiles.has(entry)) return true;
  const prefix = entry.endsWith('/') ? entry : `${entry}/`;
  for (const path of packedFiles) {
    if (path.startsWith(prefix)) return true;
  }
  return false;
}

function walkExportTargets(packageName, packedFiles, label, value) {
  if (typeof value === 'string') {
    checkTarget(packageName, packedFiles, label, value);
    return;
  }
  if (value === null || typeof value !== 'object') return;

  for (const [condition, target] of Object.entries(value)) {
    walkExportTargets(
      packageName,
      packedFiles,
      `${label}.${condition}`,
      target,
    );
  }
}

for (const directory of readdirSync(packagesRoot, { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  const packageRoot = join(packagesRoot, directory.name);
  const manifestPath = join(packageRoot, 'package.json');
  if (!existsSync(manifestPath)) continue;

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.private === true || !manifest.name?.startsWith('@concepta/')) {
    continue;
  }

  const nodeEngine = manifest.engines?.node;
  const minimumMajor = /^>=\s*(\d+)/.exec(nodeEngine ?? '')?.[1];
  if (minimumMajor === undefined || Number(minimumMajor) < 20) {
    fail(manifest.name, 'engines.node must declare a minimum of Node.js 20');
  }
  if (manifest.publishConfig?.access !== 'public') {
    fail(manifest.name, 'publishConfig.access must be public');
  }

  let packedFiles;
  try {
    packedFiles = packedFilePaths(packageRoot);
  } catch (error) {
    fail(manifest.name, `npm pack --dry-run failed: ${error.message}`);
    continue;
  }

  for (const entry of manifest.files ?? []) {
    if (typeof entry !== 'string' || /[*?!{[]/.test(entry)) continue;
    if (!tarballIncludes(packedFiles, entry)) {
      fail(manifest.name, `files entry produced no packed artifacts: ${entry}`);
      continue;
    }
    checkedArtifacts += 1;
  }

  if (typeof manifest.main === 'string') {
    checkTarget(manifest.name, packedFiles, 'main', manifest.main);
  } else {
    fail(manifest.name, 'main is not declared');
  }
  if (typeof manifest.types === 'string') {
    checkTarget(manifest.name, packedFiles, 'types', manifest.types);
  } else {
    fail(manifest.name, 'types is not declared');
  }

  walkExportTargets(manifest.name, packedFiles, 'exports', manifest.exports);

  const bins =
    typeof manifest.bin === 'string'
      ? { [manifest.name]: manifest.bin }
      : (manifest.bin ?? {});
  for (const [name, target] of Object.entries(bins)) {
    checkTarget(manifest.name, packedFiles, `bin.${name}`, target);
    if (typeof target !== 'string') continue;
    const binPath = resolve(packageRoot, target);
    if (!existsSync(binPath)) continue;
    const contents = readFileSync(binPath, 'utf8');
    if (contents.includes('ts-node/register') || contents.includes('../src/')) {
      fail(manifest.name, `bin.${name} depends on unpublished TypeScript source`);
    }
  }
}

if (failures.length > 0) {
  console.error('Package artifact verification failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Verified ${checkedArtifacts} public package targets against packed tarballs.`,
  );
}
