---
description: Build, test, and lint commands for the project
---

# Build, Test, Lint

Run checks in this order after code changes:

1. `yarn build`
2. `yarn typecheck:spec` — type-checks all test files (the runner only
   transpiles; without this, spec type errors ship silently)
3. `yarn test`
4. `yarn test:e2e`
5. `yarn lint`

CI also runs: `yarn lint:all`, `yarn typecheck:spec`, `yarn test:ci`

Coverage: `yarn test:e2e:cov` (the `e2e-packages` project + `--coverage`).

# Testing Strategy

## Prefer E2E / Integration Tests

New tests **must** be `*.e2e-spec.ts` (integration / e2e) unless there is a
specific reason for a unit test. Integration tests that boot a real Nest app
with `supertest` are the primary way to verify behavior in this project.

- Use `Test.createTestingModule` + `app.init()` with SQLite for DB-backed flows.
- Reuse existing fixtures from `packages/rockets-server-auth/src/__fixtures__/`.
- Shared bootstrap helpers live in `packages/rockets-server-auth/src/__e2e__/helpers/`.

## Test Runner: Vitest

The monorepo tests under **Vitest 4** using the `projects` model: the
root `vitest.config.mts` declares every project (`unit`, `e2e-packages`,
and one per example workspace); `vitest.shared.mts` carries the common
plugin/settings. Select with `--project <name>`; `vitest run` with no
filter runs everything (requires `yarn build` first). Key facts:

- Decorator metadata (Nest DI) comes from `unplugin-swc` — esbuild cannot
  emit it. Never remove the swc plugin from a config.
- `globals` is `false` everywhere: every test file imports what it uses
  (`import { describe, it, expect, vi } from 'vitest'`).
- `pool: 'forks'` runs each spec file in a fresh process — the isolation
  the old Jest setup needed a custom runner script for. There is no
  `scripts/` directory anymore; do not reintroduce one for test plumbing.
- Intermittent full-run failures with a rotating victim suite are
  **host memory pressure**, not a code defect — diagnosed in CHANGELOG.md
  ("Intermittent e2e failures"). A failing run takes ~20x longer and the
  captured failures are 30s timeouts, not real HTTP errors. On a
  memory-constrained machine use `--maxWorkers=2` or free memory; never
  "fix" it by retrying, skipping, or weakening assertions.

Also: **never** import a `domains/*/index` barrel inside an e2e file that
boots a Nest app — barrels register `@CommandHandler` / `@QueryHandler` in
global Reflect metadata.

## Test File Placement

| Kind | Naming | Location |
|------|--------|----------|
| E2E (preferred) | `*.e2e-spec.ts` | Co-located or in `__tests__/` next to the module |
| Unit (only when needed) | `*.spec.ts` | Co-located next to the source file |
| Fixtures | `*.fixture.ts` | `__fixtures__/` directories |

## Coverage Target

Statements / Lines ≥ **80 %** on `yarn test:e2e:cov`.
