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

function checkTarget(packageName, packageRoot, label, target) {
  if (target.includes('/src/') || target.startsWith('./src/')) {
    fail(packageName, `${label} points at unpublished source: ${target}`);
    return;
  }

  const artifact = resolve(packageRoot, target);
  if (!existsSync(artifact)) {
    fail(packageName, `${label} target does not exist: ${target}`);
    return;
  }
  checkedArtifacts += 1;
}

function walkExportTargets(packageName, packageRoot, label, value) {
  if (typeof value === 'string') {
    checkTarget(packageName, packageRoot, label, value);
    return;
  }
  if (value === null || typeof value !== 'object') return;

  for (const [condition, target] of Object.entries(value)) {
    walkExportTargets(
      packageName,
      packageRoot,
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

  for (const entry of manifest.files ?? []) {
    if (typeof entry !== 'string' || /[*?!{[]/.test(entry)) continue;
    checkTarget(manifest.name, packageRoot, 'files', entry);
  }

  if (typeof manifest.main === 'string') {
    checkTarget(manifest.name, packageRoot, 'main', manifest.main);
  } else {
    fail(manifest.name, 'main is not declared');
  }
  if (typeof manifest.types === 'string') {
    checkTarget(manifest.name, packageRoot, 'types', manifest.types);
  } else {
    fail(manifest.name, 'types is not declared');
  }

  walkExportTargets(manifest.name, packageRoot, 'exports', manifest.exports);

  const bins =
    typeof manifest.bin === 'string'
      ? { [manifest.name]: manifest.bin }
      : (manifest.bin ?? {});
  for (const [name, target] of Object.entries(bins)) {
    checkTarget(manifest.name, packageRoot, `bin.${name}`, target);
    if (typeof target !== 'string') continue;
    const contents = readFileSync(resolve(packageRoot, target), 'utf8');
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
  console.log(`Verified ${checkedArtifacts} public package artifact targets.`);
}
