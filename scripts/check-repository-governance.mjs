import { lstatSync, readFileSync, readlinkSync, realpathSync } from 'node:fs';
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

if (failures.length > 0) {
  console.error('Repository governance integrity check failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Verified AGENTS.md and CLAUDE.md governance invariants.');
}
