import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Read public package manifests from the repository's packages directory. */
export function readPublicPackageManifests(
  repositoryRoot,
  { namePrefix } = {},
) {
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
      const name = manifest.name ?? entry.name;
      if (namePrefix !== undefined && !name.startsWith(namePrefix)) {
        return undefined;
      }
      return { ...manifest, name };
    })
    .filter((manifest) => manifest !== undefined)
    .sort((left, right) => left.name.localeCompare(right.name));
}
