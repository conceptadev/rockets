---
description: Build, test, and lint commands for the project
---

# Build, Test, Lint

Run checks in this order after code changes:

1. `yarn build`
2. `yarn test`
3. `yarn test:e2e`
4. `yarn lint`

CI also runs: `yarn lint:all`, `yarn test:ci`

Coverage: `yarn test:e2e:cov` (root `vitest.e2e.config.ts` + `--coverage`).

# Testing Strategy

## Prefer E2E / Integration Tests

New tests **must** be `*.e2e-spec.ts` (integration / e2e) unless there is a
specific reason for a unit test. Integration tests that boot a real Nest app
with `supertest` are the primary way to verify behavior in this project.

- Use `Test.createTestingModule` + `app.init()` with SQLite for DB-backed flows.
- Reuse existing fixtures from `packages/rockets-server-auth/src/__fixtures__/`.
- Shared bootstrap helpers live in `packages/rockets-server-auth/src/__e2e__/helpers/`.

## Test Runner: Vitest

The monorepo tests under **Vitest 4** (`vitest.config.ts` for units,
`vitest.e2e.config.ts` for package e2e; each example workspace carries its
own `vitest.e2e.config.ts`). Key facts:

- Decorator metadata (Nest DI) comes from `unplugin-swc` — esbuild cannot
  emit it. Never remove the swc plugin from a config.
- `globals` is `false` everywhere: every test file imports what it uses
  (`import { describe, it, expect, vi } from 'vitest'`).
- `pool: 'forks'` runs each spec file in a fresh process — the isolation
  the old Jest setup needed a custom runner script for. There is no
  `scripts/` directory anymore; do not reintroduce one for test plumbing.
- A known **pre-existing** flake (~1 in 4 full e2e runs, one rotating
  suite fails with an unexpected 404) is documented in CHANGELOG.md under
  "Known flaky failure". Reruns are green. Do not "fix" it by retrying,
  skipping, or weakening assertions — it needs the instrumented hunt
  described there.

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
