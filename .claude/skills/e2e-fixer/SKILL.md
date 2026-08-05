---
name: e2e-fixer
description: Diagnose and fix failing or flaky tests in this monorepo, with a bias for e2e (*.e2e-spec.ts). Use when tests fail after a change, when a suite passes alone but fails in the full run, on fixture/bootstrap drift, barrel-registration collisions, teardown/open-handle leaks, or runner/config drift. Triggers on "fix the tests", "e2e failing", "flaky test", "tests pass alone but not together".
---

# E2E Fixer

E2E is the default test tier here (`*.e2e-spec.ts`, real Nest app + supertest + SQLite). Most "failures"
are environment/isolation, not logic — separate the two before editing source.

## First: is it mine, pre-existing, or flaky?

1. Run the failing suite **in isolation**: `corepack yarn vitest run --config vitest.e2e.config.ts "<suite-path>"`.
   Passes alone but fails in the full run → see the known rotating-404 flake in CHANGELOG.md before digging.
2. Establish a baseline with `git stash` (keep node_modules) and re-run the suite. Same failure on clean HEAD
   → pre-existing, not your regression. Say so explicitly; do not "fix" pre-existing breakage silently.

## Known failure classes and fixes

- **Rotating-404 full-run flake (pre-existing, under investigation).** ~1 in 4 full e2e runs, one suite fails
  with an unexpected 404 (can even turn an expected 401 into a 404); a different suite each run; never
  reproduces solo (20+ runs, incl. under synthetic CPU load) and survives one-worker fresh-fork execution.
  Evidence + next step (instrumented hunt) live in CHANGELOG.md "Known flaky failure". Rerun once to confirm
  it is this flake; do NOT retry-loop, skip, or weaken assertions.
- **Barrel registration collisions.** Importing a `domains/*/index` barrel registers `@CommandHandler`/
  `@QueryHandler` in global Reflect metadata and breaks later Nest apps in the same process. Never import a
  barrel in an e2e file that boots an app. (The barrel-last sequencer is gone; no barrel-only specs exist.)
- **Teardown / open handles.** A hanging suite process + `Parse Error: Expected HTTP/` from supertest = an app
  wasn't closed. Ensure `await app.close()` in `afterEach`/`afterAll`. `forceExit` is off on purpose — a leak
  hangs and gets reported instead of being masked.
- **Fixture drift (v7→v8).** Symptoms: 500s, `Class extends value undefined`, `x is not a function`. Fix the
  fixture to the v8 pattern — `RepositoryModule.forFeature` for every entity, no duplicate `TypeOrmModule.forRoot`,
  correct `extras` (user/otp/role/federated/invitation). Reuse `packages/rockets-server-auth/src/__fixtures__/`
  and `__e2e__/helpers/`.
- **Module-resolution after a bump.** `Cannot find module '@concepta/.../subpath'` → see **upstream-migrator**.
  Vitest resolves the package `exports` maps natively; if a subpath fails, the exports map itself is wrong.

## Rules

- New tests must be `*.e2e-spec.ts` unless a unit test is specifically justified. Coverage target ≥ 80% via `yarn test:e2e:cov`.
- Fix the test setup or the real bug — never weaken an assertion or add `any` to make red go green.
- Report the final tally honestly (passed/failed/skipped) and label each remaining failure as fixed, pre-existing, or flaky.
