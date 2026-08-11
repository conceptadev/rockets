import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRepositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
);
const stableVersionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const prereleaseVersionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

function retainedVersionPlans(repositoryRoot) {
  const versionsRoot = join(repositoryRoot, '.yarn', 'versions');
  if (!existsSync(versionsRoot)) return [];

  return readdirSync(versionsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.yml'))
    .map((entry) => entry.name)
    .sort();
}

function publicPackageManifests(repositoryRoot) {
  const packagesRoot = join(repositoryRoot, 'packages');
  if (!existsSync(packagesRoot)) return [];

  return readdirSync(packagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const manifestPath = join(packagesRoot, entry.name, 'package.json');
      if (!existsSync(manifestPath)) return undefined;

      let manifest;
      try {
        manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      } catch (error) {
        throw new Error(
          `Cannot read ${manifestPath}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }

      if (manifest.private === true) return undefined;
      return {
        name: manifest.name ?? entry.name,
        version: manifest.version,
      };
    })
    .filter((manifest) => manifest !== undefined)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function assertStableRelease(repositoryRoot = defaultRepositoryRoot) {
  const versionPlans = retainedVersionPlans(repositoryRoot);
  if (versionPlans.length > 0) {
    throw new Error(
      `Retained Yarn version plan(s) must be consumed first: ${versionPlans.join(
        ', ',
      )}. Run version:stable before a patch, minor, or major bump.`,
    );
  }

  const manifests = publicPackageManifests(repositoryRoot);
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

if (
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  try {
    const { packageCount, version } = assertStableRelease();
    console.log(
      `Stable release preflight passed for ${packageCount} public packages at ${version}.`,
    );
  } catch (error) {
    console.error(
      `Stable release preflight failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    process.exitCode = 1;
  }
}
