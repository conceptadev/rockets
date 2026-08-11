import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readPublicPackageManifests } from './public-package-manifests.mjs';

const defaultRepositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
);
const stableVersionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const prereleaseVersionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-([0-9A-Za-z-]+)(?:\.[0-9A-Za-z-]+)*(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

function retainedVersionPlans(repositoryRoot) {
  const versionsRoot = join(repositoryRoot, '.yarn', 'versions');
  if (!existsSync(versionsRoot)) return [];

  return readdirSync(versionsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.yml'))
    .map((entry) => entry.name)
    .sort();
}

export function assertStableRelease(repositoryRoot = defaultRepositoryRoot) {
  const versionPlans = retainedVersionPlans(repositoryRoot);
  if (versionPlans.length > 0) {
    const recovery =
      versionPlans.length === 1 && versionPlans[0] === 'alpha.yml'
        ? 'Run version:stable before a patch, minor, or major bump.'
        : 'Inspect and reconcile unexpected or incomplete plans before ' +
          'retrying; do not apply them blindly.';
    throw new Error(
      `Retained Yarn version plan(s) must be consumed first: ${versionPlans.join(
        ', ',
      )}. ${recovery}`,
    );
  }

  const manifests = readPublicPackageManifests(repositoryRoot);
  if (manifests.length === 0) {
    throw new Error('No public package manifests were found under packages/.');
  }

  const prereleases = manifests.filter(
    ({ version }) =>
      typeof version === 'string' && prereleaseVersionPattern.test(version),
  );
  if (prereleases.length > 0) {
    throw new Error(
      `Prerelease public manifest(s) must be promoted first: ${prereleases
        .map(({ name, version }) => `${name}@${version}`)
        .join(', ')}. Run version:stable before a patch, minor, or major bump.`,
    );
  }

  const invalid = manifests.filter(
    ({ version }) =>
      typeof version !== 'string' || !stableVersionPattern.test(version),
  );
  if (invalid.length > 0) {
    throw new Error(
      `Public manifest(s) do not have stable semantic versions: ${invalid
        .map(({ name, version }) => `${name}@${String(version)}`)
        .join(', ')}.`,
    );
  }

  const versions = [...new Set(manifests.map(({ version }) => version))].sort();
  if (versions.length !== 1) {
    throw new Error(
      `Public stable versions are not aligned: ${versions.join(', ')}`,
    );
  }

  return { packageCount: manifests.length, version: versions[0] };
}

export function assertPublishChannel(
  channel,
  repositoryRoot = defaultRepositoryRoot,
) {
  if (channel === 'latest') {
    return { channel, ...assertStableRelease(repositoryRoot) };
  }
  if (channel !== 'alpha' && channel !== 'beta') {
    throw new Error(`Unsupported npm publish channel: ${String(channel)}.`);
  }

  const manifests = readPublicPackageManifests(repositoryRoot);
  if (manifests.length === 0) {
    throw new Error('No public package manifests were found under packages/.');
  }

  const versions = [...new Set(manifests.map(({ version }) => version))];
  if (versions.length !== 1 || typeof versions[0] !== 'string') {
    throw new Error(
      `Public versions are not aligned for publish:${channel}: ${versions
        .map(String)
        .sort()
        .join(', ')}`,
    );
  }

  const version = versions[0];
  const prerelease = prereleaseVersionPattern.exec(version);
  if (prerelease?.[4] !== channel) {
    throw new Error(
      `publish:${channel} requires an aligned ${channel} prerelease; ` +
        `found ${version}.`,
    );
  }

  return { channel, packageCount: manifests.length, version };
}

if (
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  try {
    const cliArgs = process.argv.slice(2);
    if (cliArgs.length === 0) {
      const { packageCount, version } = assertStableRelease();
      console.log(
        `Stable release preflight passed for ${packageCount} public packages at ${version}.`,
      );
    } else if (cliArgs.length === 2 && cliArgs[0] === 'publish') {
      const { channel, packageCount, version } = assertPublishChannel(
        cliArgs[1],
      );
      console.log(
        `Publish preflight passed for ${packageCount} public packages at ` +
          `${version} on the ${channel} dist-tag.`,
      );
    } else {
      throw new Error(
        'Usage: node scripts/assert-stable-release.mjs [publish alpha|beta|latest]',
      );
    }
  } catch (error) {
    console.error(
      `Release preflight failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    process.exitCode = 1;
  }
}
