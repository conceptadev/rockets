import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const agentsPath = join(repositoryRoot, 'AGENTS.md');
const claudePath = join(repositoryRoot, 'CLAUDE.md');
const expectedClaudeTarget = 'AGENTS.md';
const minimumInstructionBytes = 4_096;
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

try {
  const agentsStat = lstatSync(agentsPath);
  check(agentsStat.isFile(), 'AGENTS.md must be a regular file');
  check(!agentsStat.isSymbolicLink(), 'AGENTS.md must not be a symlink');

  const contents = readFileSync(agentsPath, 'utf8');
  check(
    contents.startsWith('# AGENTS.md\n'),
    'AGENTS.md must start with the canonical heading',
  );
  check(
    Buffer.byteLength(contents) >= minimumInstructionBytes,
    `AGENTS.md must contain at least ${minimumInstructionBytes} bytes`,
  );
} catch (error) {
  failures.push(`unable to inspect AGENTS.md: ${error.message}`);
}

try {
  const claudeStat = lstatSync(claudePath);
  check(claudeStat.isSymbolicLink(), 'CLAUDE.md must be a symlink');
  check(
    readlinkSync(claudePath) === expectedClaudeTarget,
    `CLAUDE.md must point to ${expectedClaudeTarget}`,
  );
  check(
    realpathSync(claudePath) === realpathSync(agentsPath),
    'CLAUDE.md must resolve to AGENTS.md',
  );
} catch (error) {
  failures.push(`unable to inspect CLAUDE.md: ${error.message}`);
}

/**
 * A `node_modules` directory ABOVE the repository satisfies Node's
 * resolution for packages this repository never installed. Every gate
 * then passes against a dependency that is not installed here and will
 * not exist on CI or in a consumer's install.
 *
 * This is not hypothetical. Dropping `class-validator` /
 * `class-transformer` from `@concepta/rockets-auth` passed build, lint,
 * typecheck, the full unit and e2e suites AND the packed-consumer gate,
 * because an ancestor checkout supplied both from outside the repo.
 * They are load-bearing: `@concepta/nestjs-common@7` peer-declares them
 * and `require`s them at module load.
 *
 * So: every runtime dependency any workspace declares must be present
 * inside this repository's install. Presence is checked on the
 * filesystem rather than through `require.resolve`, which needs a main
 * entry and so reports false failures for types-only packages and for
 * exports-map packages with no default entry.
 */
function workspaceManifestPaths() {
  const paths = [join(repositoryRoot, 'package.json')];
  for (const group of ['packages', 'examples']) {
    const dir = join(repositoryRoot, group);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const manifest = join(dir, entry.name, 'package.json');
      if (existsSync(manifest)) paths.push(manifest);
    }
  }
  return paths;
}

/** Where a package may legitimately live under a node-modules linker. */
function isInstalledInRepository(name, manifestPath) {
  const candidates = [
    join(dirname(manifestPath), 'node_modules', name),
    join(repositoryRoot, 'node_modules', name),
  ];
  return candidates.some((candidate) => existsSync(candidate));
}

for (const manifestPath of workspaceManifestPaths()) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    failures.push(`unable to read ${manifestPath}: ${error.message}`);
    continue;
  }
  const workspaceName = manifest.name ?? manifestPath;
  for (const [name, range] of Object.entries(manifest.dependencies ?? {})) {
    // Workspace links resolve through the linker, not this layout.
    if (String(range).startsWith('workspace:')) continue;
    if (isInstalledInRepository(name, manifestPath)) continue;
    failures.push(
      `${workspaceName} declares "${name}" but it is not installed inside ` +
        'this repository — either the install is stale, or an ancestor ' +
        'node_modules is supplying it and every gate can pass on something ' +
        'CI will not have',
    );
  }
}

if (failures.length > 0) {
  console.error('Repository governance integrity check failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    'Verified AGENTS.md and CLAUDE.md governance invariants, and that every ' +
      'declared runtime dependency is installed inside the repository.',
  );
}
