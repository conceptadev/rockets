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

Coverage: `yarn test:e2e:cov` (uses `jest.config-e2e.coverage.json`).

# Testing Strategy

## Prefer E2E / Integration Tests

New tests **must** be `*.e2e-spec.ts` (integration / e2e) unless there is a
specific reason for a unit test. Integration tests that boot a real Nest app
with `supertest` are the primary way to verify behavior in this project.

- Use `Test.createTestingModule` + `app.init()` with SQLite for DB-backed flows.
- Reuse existing fixtures from `packages/rockets-server-auth/src/__fixtures__/`.
- Shared bootstrap helpers live in `packages/rockets-server-auth/src/__e2e__/helpers/`.

## E2E Process Isolation

Package e2e suites run **one Jest process per spec file** via
`scripts/run-isolated-e2e.cjs` (both `test:e2e` and `test:e2e:cov` route
through it). Sharing one worker made the full run fail ~25% of the time with
a rotating victim suite — cumulative process state across ~30 Nest + TypeORM
app boots; every suite is green in isolation. `forceExit` is off: a suite
that leaks a handle hangs its own process and gets reported instead of
poisoning the next suite.

The runner is a bridge: the planned Vitest migration (`pool: 'forks'` +
`isolate: true` gives the same per-file process isolation natively) deletes
it along with the Babel ESM-compat plugins.

Also: **never** import a `domains/*/index` barrel inside an e2e file that
boots a Nest app — barrels register `@CommandHandler` / `@QueryHandler` in
global Reflect metadata. (The old barrel-last `testSequencer` is gone; no
barrel-only specs exist anymore.)

## Test File Placement

| Kind | Naming | Location |
|------|--------|----------|
| E2E (preferred) | `*.e2e-spec.ts` | Co-located or in `__tests__/` next to the module |
| Unit (only when needed) | `*.spec.ts` | Co-located next to the source file |
| Fixtures | `*.fixture.ts` | `__fixtures__/` directories |

## Coverage Target

Statements / Lines ≥ **80 %** on `yarn test:e2e:cov`.
