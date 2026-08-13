# Changelog

All notable changes to this monorepo are documented in this file.
Per-package release notes live in `packages/*/CHANGELOG.md`.

## [Unreleased]

### Added

- Firestore adapter transactions (issue #44 P1-1): `runInFirestoreTransaction`
  (callback-scoped, retry-safe), `transactionFactories` + `options.ctx`
  threading, transactional duplicate-id → 409 mapping, and `limit()` on
  transactional queries. Contended RMW must use the callback API.

### Removed

- **`SafeCrudContextInterceptor`** — upstream `@concepta/nestjs-crud`
  `CrudContextOverlay.attach()` already no-ops on non-CRUD handlers
  (`5249672`, shipped in `8.0.0-alpha.8`). Core and auth now use
  `CrudModule.forRoot` / `forRootAsync` directly. The regression guard is a
  core e2e that mounts a plain controller next to a `defineResource` CRUD
  resource (which boots the real `CrudContextOverlay`) and asserts the
  non-CRUD route does not 500
  (`rockets-core-resources.e2e-spec.ts`); every auth e2e also boots the
  overlay via `CrudModule.forRootAsync` beside hand-written controllers.

### Documentation

- `SECURITY.md` and sample READMEs no longer claim an npm `alpha` channel that
  is not published yet.

### Release preparation

- Public Rockets package manifests are aligned at `1.0.0-alpha.8`. Registry
  publication, dist-tag updates, and the GitHub release remain separate
  post-merge operations.
- Release gates now install the real packed tarballs in a clean consumer,
  exercise CommonJS and ESM entry points (including `/zod`), strict-type every
  public package root, compile a minimal TypeScript app, and bootstrap/close
  Nest.
- The representative auth sample's complete generated OpenAPI document is
  validated in process, with explicit regressions for path parameters,
  duplicate parameter keys, and mixed OpenAPI 2/3 response shapes.
- The alpha.8 line also includes Firestore-compatible Unicode map-key
  ordering.

### Testing infrastructure — Jest replaced by Vitest

The whole monorepo (6 packages + 3 example workspaces) now tests under
Vitest 4. What this deletes, permanently:

- `scripts/run-isolated-e2e.cjs` — the one-process-per-spec-file bridge;
  `pool: 'forks'` gives every spec file a fresh process natively (verified:
  distinct pid per file even at one worker).
- Both Babel plugins that adapted the ESM-only `@nestjs` v12 dist to
  Jest's CJS runtime — Vitest runs ESM natively.
- All 14 Jest config files, `tsconfig.jest.json`, and every jest/ts-jest/
  babel-jest/jest-junit/jest-extended/jest-mock-extended/@types/jest
  dependency. The root `scripts/` directory no longer exists.

The setup follows Vitest 4's official monorepo guidance — the
`projects` model: the root `vitest.config.mts` declares every project
(`unit`, `e2e-packages`, one per example workspace) and
`vitest.shared.mts` carries the shared plugin/settings (deliberately not
the root config — merging a projects-bearing config into a project is a
documented pitfall). Example configs are `defineProject` +
`mergeConfig(shared, …)`; one SWC block exists instead of five.
Coverage and reporters live at root (root-only by design); coverage
thresholds are asserted per run by the unit-gate scripts, because the
e2e coverage run was historically threshold-free.

Decorator metadata (NestJS DI) is emitted by `unplugin-swc` — esbuild,
Vitest's default transform, cannot emit it. Test files import their API
explicitly (`import { describe, it, expect, vi } from 'vitest'`);
`globals` is `false` in every config, so nothing depends on ambient
typings. Test counts match the Jest baselines exactly: units 62 files /
572 tests, package e2e 30 / 156, samples 8/194 + 2/40 + 4 files/9 tests.
CI junit + lcov + json artifacts are produced at the same paths as
before.

Test files are now actually type-checked (`yarn typecheck:spec`, wired
into CI): ts-jest ran with `isolatedModules` and therefore only
transpiled, so spec files were never seen by the compiler — under SWC
that stayed true. The new gate surfaced 42 latent type errors across 19
files on its first run (stale fixtures importing upstream members that
no longer exist, alpha.8 entity-contract drift in the e2e factory
fixtures, deep `dist/` imports blocked by upstream exports maps, and
under-typed test doubles), all fixed rather than suppressed. Two
interfaces that consumers legitimately need
(`EmailSendOptionsInterface`, `RocketsAuthUserMetadataModelUpdatableInterface`)
are now exported from `@concepta/rockets-auth`'s public index instead
of being reachable only through `dist/` paths.

Migration incidentally fixed two latent defects: the
sample-code-review Jest config had lost its `setupFiles` wiring (its
FIREBASE_PROJECT_ID default never applied), and a lazy-`require` cycle
workaround in `rockets-auth-handler-overrides.spec.ts` became typed
`beforeAll` dynamic imports.

### Naming

- **npm scope renamed `@conceptadev` → `@concepta`.** Rockets packages now
  publish alongside the upstream `@concepta/nestjs-*` stack they compose,
  distinguished by name rather than by a separate scope:
  `@concepta/rockets`, `@concepta/rockets-auth`, `@concepta/rockets-core`,
  `@concepta/rockets-repository-typeorm`,
  `@concepta/rockets-repository-firestore`,
  `@concepta/rockets-adapter-firebase`. Nothing had been published under
  the old scope, so no consumer is affected.
- **GitHub organization is `conceptadev`**; every `repository`,
  `homepage` and `bugs` field now points at `github.com/conceptadev/rockets`.
- An architecture lint rule that forbids `rockets-core` from importing the
  auth package referenced a package name that never existed
  (`@concepta/rockets-server-auth` vs the real `@concepta/rockets-auth`), so
  it could never fire. Corrected and verified to trigger.

### Security — dependencies

- **TypeORM bumped 0.3.28 → 0.3.31**, clearing both advisories that
  `yarn npm audit` reported: SQL injection in
  `UpdateQueryBuilder`/`SoftDeleteQueryBuilder` `orderBy` on
  MySQL/MariaDB (GHSA-9ggv-8w38-r7pm, fixed in 0.3.29) and
  `migration:generate` template-literal code injection
  (GHSA-2rp8-mm9q-fp49, fixed in 0.3.31). The version was held back by a
  root `resolutions` pin, so bumping the declared ranges alone had no
  effect — the pin was raised too. Audit now reports only two
  deprecation notices (eslint 8, rimraf 3), both dev-only tooling that
  never ships to consumers.

### Intermittent e2e failures — diagnosed, not a code defect

Full e2e runs intermittently failed (~1 in 4) with a rotating victim
suite and inconsistent symptoms (unexpected 404, an expected 401
arriving as 404, `Parse Error: Expected HTTP/` from supertest). The
instrumented hunt closed it: **host memory pressure, not a defect in
this repo.**

Evidence: a failing run took **216s against 10.8s** for a passing one,
with two independent suites stalling in the same instant; the captured
failures were 30s timeouts with no HTTP response at all (no 404 was ever
returned — the earlier 404 reading was a symptom of a request dying
mid-flight); sampling the host during the loop showed **~16 MB of free
RAM and continuous pageouts** on a 16 GB machine already carrying 26 GB
of swap. When the OS swaps a Node process mid-request, it freezes long
enough for supertest to time out, and the surfaced error varies with
where it froze.

This explains every property that defeated the earlier hypotheses
(leaked apps, libuv threadpool exhaustion, poisoned file pairs,
cross-process state — all tested and ruled out): the cause is host-level,
so process isolation cannot prevent it, a single suite never triggers it,
and the signature predates the Vitest migration (identical under Jest).

Not a CI risk: a full run peaks at ~650 MB across 4 workers, well within
the 4 GB of a standard GitHub runner. On a memory-constrained
workstation, lower the worker count (`--maxWorkers=2`) or free memory
before running the full e2e suite.

### Security

- OTP consume is now the single decision point for burning passcodes:
  `RocketsValidateOtpHandler` dispatches `ConsumeOtpCommand` directly when
  `deleteIfValid` is true (no prior `ValidateOtpQuery`), and recovery
  `updatePassword` consumes before mutating the password. A failed password
  write after consume still leaves the proof burned (user must restart
  recovery). DB-level single-winner under concurrent consumes still needs
  upstream nestjs-otp locking; this closes the application validate-then-
  consume TOCTOU only.
- Root resolutions bumped: `tar` → `7.5.22`, `js-yaml` → `4.3.1`,
  `shell-quote` → `1.10.0`.
- **Owner scoping is now on by default** (`zodResource` / `zodSubResource`).
  Any resource with an owner column (`f.owner()` or `owner: '<field>'`) gets
  an `OwnerScopeHook` on the read path in addition to the existing
  `OwnerStampHook` on the write path — list/read/update/delete only see the
  actor's own rows. **Breaking:** consumers relying on unscoped reads must
  opt out per resource with `ownerScope: false` (see
  `examples/sample-server/src/resources/pet/pet.resource.ts`, which opts out
  in favour of a custom owner-or-shared hook).
- **Response DTO exposure is opt-in.** A field reaches the response DTO only
  when it opts in (`dto: { response: true }` — every `f.*` helper sets this
  by default) or is a base-entity column (pk / createdAt / updatedAt /
  deletedAt). Raw zod fields without metadata stay off the wire, so
  forgetting to annotate fails closed. The credential-name heuristic
  (`/password|secret|token|mfa|otp|hash/i`) was **removed**: it hid harmless
  fields (`tokenExpiresAt`, `mfaEnabled`, `hashtags`) while missing real
  secrets (`apiKey`, `salt`, `cardNumber`). Keep secrets out with an
  explicit `dto: { response: false }`.
- **`defineZodUserMetadata` now projects through `projectSchema`** — the
  same projection path `zodResource` uses. Previously it compiled the whole
  schema into the response DTO, so `dto: { response: false }` was silently
  ignored for userMetadata columns.
- **Computed fields respect `dto: { response: false }`.** `f.compute`
  schemas built from entity schemas no longer re-expose columns the owning
  resource hides.
- **Path-scope invariants assert on real artifacts.** Sub-resource
  materialisation now verifies `PathScopeGuard` / `PathScopeHook` survived
  provider merging in `core.providers`; the write-only `meta.guards` mirror
  (and the tests that asserted on it) was removed in favour of behavioural
  e2e coverage (cross-owner nested access returns 404).

### Fixed

- `RocketsCoreExceptionsFilter` logs through Nest's `Logger` instead of
  `console.error`, on every 5xx — whether traces are printed is the
  consuming app's log-level decision, no longer gated on `NODE_ENV`
  (which is unset in many production containers). Validation errors are
  flattened by a local, typed implementation instead of reaching into
  Nest's private `ValidationPipe['flattenValidationErrors']`.
- `defineSubResource` distinguishes an entity class from a thunk via the
  `prototype` property descriptor (spec-mandated non-writable for ES6
  classes) instead of guessing from its presence; the genuinely ambiguous
  `function () {}` form now throws with guidance instead of silently
  resolving to the wrong interpretation.
- Firestore adapter round-trips `Date` values as native Firestore
  `Timestamp`s. Previously dates were stringified on write and guessed
  back from field names on read (`startsWith('date') || endsWith('At')`),
  so `dateCreated` came back a `Date` while `birthday` came back a string
  — the returned TYPE depended on the field NAME. Native `Timestamp`
  also makes range queries and ordering by date work correctly (ISO
  strings only sorted by lexicographic luck).
  **Storage format change, safe now:** rows written by earlier builds
  hold ISO strings and are no longer converted on read. This is a
  non-issue today — `@concepta/rockets-repository-firestore` has never
  been published to npm (404 on the registry) and the only in-repo
  consumer is the sample app's test stub, so no persisted data exists to
  migrate. Doing this after the first release would have required a
  backfill.
- `InMemoryFirestoreBackend` keeps its store per instance; previously all
  instances in a process shared one module-level `Map`.
- Hook subclass caches (`OwnerScopeHook`, `OwnerStampHook`,
  `PathScopeHook`, `AfterCreateReloadHook`) use `WeakMap` keyed by entity
  class, matching `schema-registry` / `paginated-dto.factory`, so cached
  subclasses no longer pin entity classes for the process lifetime.
- `sample-server-auth` entities updated to the
  `@concepta/nestjs-* 8.0.0-alpha.8` contracts (`IdentityInterface.user`,
  required `passwordHash` / `type` / `description` columns).

### Testing

- Package e2e suites run one Jest process per spec file
  (`scripts/run-isolated-e2e.cjs`). Sharing one worker failed ~25% of full
  runs with rotating victims — cumulative process state across ~30 Nest +
  TypeORM app boots; every suite is green in isolation. `forceExit` and the
  barrel-last sequencer were removed (no barrel specs exist; runs exit
  cleanly on their own).
- The e2e-only monkey-patch of `@nestjs/core`'s `DependenciesScanner` and
  `CrudModule.forFeature` was deleted — the upstream sparse-exports bug it
  compensated for is fixed in `@concepta/nestjs-crud 8.0.0-alpha.8`. Suites
  now run against the real framework.
- A core e2e mounts a plain controller next to a `defineResource` CRUD
  resource (so the real `CrudContextOverlay` is registered) and asserts the
  non-CRUD route stays 200, guarding the `SafeCrudContextInterceptor`
  removal against an upstream regression.

### Known limitations

- Depends on pre-release `@concepta/nestjs-* 8.0.0-alpha.x`; upstream
  interface changes between alphas can break consumers (this release
  absorbs one such change).
- `relation.shape` projections are filtered by the response opt-in rule
  while `f.compute` schemas are only filtered for explicit
  `response: false`; unifying the two is deliberate follow-up work.
- ~~`scripts/run-isolated-e2e.cjs` and the two Babel plugins that adapt
  the ESM-only `@nestjs` v12 dist to Jest's CJS runtime are bridges: the
  planned Vitest migration (native ESM, `pool: 'forks'` isolation)
  removes all of them.~~ Done — see "Testing infrastructure" above.
