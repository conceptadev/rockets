import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test, { afterEach } from 'node:test';
import { fileURLToPath } from 'node:url';

import { assertStableRelease } from './assert-stable-release.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rootManifest = JSON.parse(
  readFileSync(join(repositoryRoot, 'package.json'), 'utf8'),
);
const temporaryRoots = [];

afterEach(() => {
  for (const temporaryRoot of temporaryRoots.splice(0)) {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function createFixture(manifests) {
  const root = mkdtempSync(join(tmpdir(), 'rockets-stable-release-test-'));
  temporaryRoots.push(root);

  for (const [directory, manifest] of Object.entries(manifests)) {
    const packageRoot = join(root, 'packages', directory);
    mkdirSync(packageRoot, { recursive: true });
    writeJson(join(packageRoot, 'package.json'), manifest);
  }

  return root;
}

function addVersionPlan(root, name = 'alpha.yml') {
  const versionsRoot = join(root, '.yarn', 'versions');
  mkdirSync(versionsRoot, { recursive: true });
  writeFileSync(join(versionsRoot, name), 'releases: {}\n');
}

test('stable version commands assert the stable release state first', () => {
  for (const scriptName of [
    'version:patch',
    'version:minor',
    'version:major',
  ]) {
    const command = rootManifest.scripts[scriptName];
    const assertionIndex = command.indexOf(
      'node scripts/assert-stable-release.mjs',
    );
    const versionIndex = command.indexOf('yarn workspaces foreach');

    assert.ok(
      assertionIndex >= 0 && assertionIndex < versionIndex,
      `${scriptName} must assert the stable release state before versioning`,
    );
  }

  assert.match(
    rootManifest.scripts['release:packages'],
    /node --test scripts\/assert-stable-release\.test\.mjs/,
  );
});

test('accepts aligned stable public manifests and ignores private workspaces', () => {
  const root = createFixture({
    core: { name: '@concepta/core', version: '1.2.3' },
    server: { name: '@concepta/server', version: '1.2.3' },
    example: { name: 'private-example', version: '0.0.0-dev.0', private: true },
  });

  assert.deepEqual(assertStableRelease(root), {
    packageCount: 2,
    version: '1.2.3',
  });
});

test('rejects a retained Yarn version plan', () => {
  const root = createFixture({
    core: { name: '@concepta/core', version: '1.2.3' },
  });
  addVersionPlan(root);

  assert.throws(
    () => assertStableRelease(root),
    /retained Yarn version plan.*alpha\.yml/i,
  );
});

test('rejects a prerelease public manifest', () => {
  const root = createFixture({
    core: { name: '@concepta/core', version: '1.2.3-alpha.8' },
  });

  assert.throws(
    () => assertStableRelease(root),
    /prerelease.*@concepta\/core.*1\.2\.3-alpha\.8/i,
  );
});

test('rejects misaligned public stable versions', () => {
  const root = createFixture({
    core: { name: '@concepta/core', version: '1.2.3' },
    server: { name: '@concepta/server', version: '1.3.0' },
  });

  assert.throws(
    () => assertStableRelease(root),
    /not aligned.*1\.2\.3.*1\.3\.0/i,
  );
});
