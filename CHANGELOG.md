# Changelog

All notable changes to this monorepo are documented in this file.
Per-package release notes live in `packages/*/CHANGELOG.md`.

## [Unreleased]

### Added

- **Background job dispatch port (issue #53).**
  `JobDispatchServiceInterface` (`enqueue` / `claim` / `heartbeat` /
  `complete` / `fail`) under `JOB_DISPATCH_SERVICE_TOKEN` — named tasks
  with dedupe (a repeat `enqueue` under the same `dedupeKey` while a job
  is still active returns the existing job instead of a new one),
  lease-based claiming, and at-least-once delivery (an expired lease
  makes a job claimable again with `attempt` incremented, so a crashed
  worker's job gets redelivered). `InProcessJobDispatchService` ships as
  the in-memory reference adapter for tests/samples; no queue vendor is
  a core dependency, matching the storage-SDK-free rule for the file
  upload seam. Common shape: an `operationResource` write op enqueues
  and returns `202` + job id immediately, a worker calls
  `claim`/`heartbeat`/`complete` separately. See `CONFIGURATION.md` §6d.

- **Idempotency keys and inbound webhook signature verification (issue
  #59).** `IdempotencyStoreInterface` (`get`/`set`) under
  `IDEMPOTENCY_STORE_TOKEN` plus `hashIdempotentRequest` (a
  key-order-stable hash used to detect a reused idempotency key with a
  DIFFERENT request body — a client error, not a replay).
  `InMemoryIdempotencyStore` ships as the reference adapter. No new
  `operationResource` option: a handler CLASS checks the store before
  doing the real work and replays the cached result on a match, the
  same documented-pattern shape as the file upload seam.
  `verifyWebhookSignature` is a timing-safe HMAC compare
  (`crypto.timingSafeEqual`) against the RAW request body — read via
  Nest's own `rawBody: true` app option, since a parsed-then-reserialized
  JSON body is not guaranteed byte-identical to what a provider signed.
  `createWebhookSignatureVerifier` binds the secret once and validates
  it EAGERLY, so it belongs in a provider factory: an unset
  `WEBHOOK_SECRET` or a misspelled algorithm then fails the boot instead
  of 401-ing every legitimate delivery in production.
  The documented idempotency pattern scopes the store key by the
  authenticated principal (`` `${userId}:${key}` ``) and replays the
  STORED status, not the operation's declared one. The store is
  documented as at-least-once: `get`/`set` has no atomic reserve, so
  concurrent first-writers under one key both run (7 of 20 measured) —
  it de-duplicates sequential retries, and an atomic reserve on the port
  remains an open design question.
  See `CONFIGURATION.md` §6e.

- **`TenantScopeHook` — fail-closed row scoping by resolved tenant set
  (issue #69).** Complements `acl` (#51): `acl` decides which actions an
  actor may perform, this decides which rows. `TenantScopeHook.for(entity,
  { tenantKey, resolve })` scopes `list`/`read`/`update`/`delete` to rows
  whose `tenantKey` is in `resolve(actor)`'s result — and, unlike
  `OwnerScopeHook` (which deliberately no-ops with no actor, reasoning an
  unauthenticated request on a protected route already failed upstream),
  this is fail-closed on purpose: no actor, or a `resolve` returning `[]`,
  both produce a WHERE clause matching nothing, never an unfiltered
  query — the fail-open gap the issue exists to close. A row outside the
  resolved set 404s (never found by the query), not 403. The empty-set
  case is a `Where.isNull(tenantKey)` AND `Where.notNull(tenantKey)`
  contradiction rather than `Where.in(tenantKey, [])` — several SQL
  engines, TypeORM's own `In([])` historically included, do not reliably
  treat an empty IN-list as "match nothing." See `CONFIGURATION.md` §5b.

  `TenantScopeHook` rewrites `where` clauses and nothing else, so it does
  NOT constrain the tenant column on writes: `POST` issues no `find` at
  all, and `PATCH`/`PUT` scope the lookup but never inspect the update
  payload — a body carrying another tenant's id moves the row out of the
  actor's tenant. An earlier revision of this entry (and of
  `CONFIGURATION.md` §5b) told readers to close that by stamping "the same
  way `OwnerStampHook` stamps ownership." That advice was **wrong**:
  `OwnerStampHook` stamps `actor.id`, and an actor's user id is not one of
  their tenant ids, so following it writes the wrong value into the column.

- **`TenantStampHook` — the write-side half of tenant scoping.**
  `TenantStampHook.for(entity, { tenantKey, resolve })` enforces the same
  resolved set on `beforeCreate`/`beforeUpdate`. A payload value inside
  the set passes; a value outside it is **rejected with `403`, never
  silently rewritten** (the opposite of `OwnerStampHook`, deliberately —
  there is one legal owner id but there can be several legal tenant ids,
  so silently picking one would persist the row somewhere the caller never
  asked for). An omitted value is stamped on `create` when the actor
  resolves to exactly one tenant, `403`s when they resolve to none, and
  `400`s as ambiguous when they resolve to several; on `update` it is left
  absent, since the scoped `findOne` already proved the row is in range.
  Pass the SAME resolver to both hooks. Like `OwnerStampHook`, the 4xx
  statuses require `RocketsCoreExceptionsFilter` to be registered — the
  upstream membrane wraps hook throws in `RepositoryQueryException`, and
  without the filter the (still-rejected) write reports `500`.

- **`strictInput` on zodResource body operations (issue #79).** Opt-in
  per-op flag that rejects unknown **top-level** JSON keys with `400`
  naming the offending keys, instead of the default silent stripping
  (nested objects still strip — zod's `.strict()` does not recurse). It
  applies to whichever input schema is in effect — the derived create /
  update projection or an `input` override. Fields the projection
  excludes (`id`, timestamps, `version`, owner columns) are rejected
  under strict, so read-modify-write clients must strip server-owned
  keys. With `nestjs-zod`'s `cleanupOpenApiDoc` applied to the document,
  the schema gains `additionalProperties: false`. Declaring the flag on
  an operation with no request body fails at definition time.

- **Structured `details` and typed `request` on the error serializer
  context (issue #55 residuals).** Validation `400`s minted by Rockets
  now hand the serializer `details: [{ path, message }]` — path as an
  array of segments, one entry per unrecognized strict key — and every
  error passing through `RocketsCoreExceptionsFilter` hands it `request`
  in the same typed shape operation handlers receive, so a correlation
  id in the body no longer requires forking the filter (serializers
  return a body only — response headers such as `Retry-After` remain
  out of reach until a response seam exists). Details ride
  the exception under a symbol, never the response payload — an app
  without the filter sees the unchanged Nest body (pinned by a test).
  The default envelope body is byte-shape unchanged;
  `detailedErrorSerializer` is the one-line opt-in that appends
  `details`. `400`s minted by the upstream class-validator pipe carry
  messages only — the one limit, stated rather than papered over. Reach
  is per APP, not per package: any app that registers
  `RocketsCoreExceptionsFilter` gets the seam, `@concepta/rockets-auth`
  apps included (`examples/sample-server-auth` already does, via
  `@concepta/rockets`' `ExceptionsFilter` re-export).

- **Schema DTOs survive class-validator whitelist pipes (issue #83).**
  Three pieces. `StandardSchemaDtoValidationPipe` now recognises any
  class carrying a Standard Schema as its static `schema` — bare
  `nestjs-zod` DTOs included, not only Rockets-branded ones.
  `allowStandardSchemaKeys(dto)` stamps `@Allow()` per declared key so a
  schema DTO survives ANY `ValidationPipe({ whitelist: true })` (Rockets'
  own `compileDtoClass` output ships stamped). And
  `StandardSchemaAwareValidationPipe` is Nest's `ValidationPipe` that
  VALIDATES schema-carrying metatypes with their own schema instead of
  emptying them to `{}` — standalone-safe (register exactly one schema
  validator per route: pairing double-parses, and a transforming schema
  is not idempotent), forwarding `transform` / `errorHttpStatusCode` so
  both DTO kinds fail alike, and rejecting loudly the ambiguous
  both-schema-and-constraints shape. The
  trap itself is pinned by a test: unstamped DTO + plain whitelist pipe
  still yields `{}`, so the docs' claim about the hazard stays honest.
  One predicate defines carrier recognition (`getCarriedStandardSchema`),
  imported everywhere directly — the tolerant same-named alias in
  `common/utils` is gone. Behaviour note for existing consumers:
  generated zod DTOs previously carried zero class-validator metadata,
  so a pipe with `forbidUnknownValues` rejected them outright; stamped,
  they are now accepted. The stamp is SURVIVAL, not validation — the
  body is only checked when a schema pipe (`StandardSchemaModule` or
  the aware pipe) is registered; without one, a route that used to 400
  on these DTOs now accepts the raw body. A visible change either way.

- **Route policy audit (`routePolicy`).** `RocketsCoreModule.forRoot`
  accepts `routePolicy: { requireAuth, requireAcl, requireAclQuery, allow,
  allowControllers }`, checked at bootstrap over every discovered
  controller — generated CRUD, operation and module resources, hand-built
  configs, and controllers owned by other packages. A violation fails the
  boot and lists every offending route at once. Closes the coverage gap
  `planAccessControl` documents: the planner only sees what it generates
  and runs before controllers exist, so a hand-written `AccessControlGrant`
  in a bundle's `decorators: []` is invisible to it. Without a policy
  nothing is registered; with one, `RouteAuditService.audit()` returns the
  full table for a CI artifact. A route is `guarded` only when a global
  guard RECOGNISED as authentication is present — `AuthServerGuard`, or
  classes listed in `routePolicy.authGuards`; resolved instances are read
  from `ApplicationConfig`, so a guard factory resolving to `null` (as
  upstream access-control registers under `appGuard: false`) and
  request-scoped guards are classified correctly, and an app whose only
  global guard authenticates nothing cannot be reported as protected.
  Forwarded through `RocketsModule.forRoot({ routePolicy })`.

- **`operationResource` / `defineOperationResource` (issues #43 / #50).** Typed
  non-CRUD HTTP endpoints beside CRUD: Zod `input`/`output` → DTO + OpenAPI,
  generated Nest controller, auth/`public`, optional `transactional`, function
  or injectable `handle` handlers. Authoring: callback `operations(op)` with
  `op.read` / `op.write` / `op.delete`; path defaults to the operation key;
  `output` required (schema or `false`); optional resource-level `params` zod;
  cross-resource `METHOD+path` collisions fail in `buildAppRegistrationPlan`.
  See `CONFIGURATION.md` §6a and `examples/sample-server` `petTransferFeature`.
- **First-class access control on resources and operations (issue #51).**
  `defineResource`, `zodResource` and `operationResource` accept
  `acl: { resource, query }`, and each operation accepts `acl` to override
  the action or opt out with `false`. The framework materialises the
  upstream `AccessControlGrant` / `AccessControlQuery` decorators, and
  collects every `acl.query` service into
  `AccessControlModule.forRoot({ queryServices })` — the module the
  upstream guard strict-resolves from, so a declared service can no
  longer 500 at request time because nobody registered it.

  This closes a real hole rather than adding sugar: upstream's
  check-access handler returns `true` for any route with no grant
  metadata, so a forgotten decorator is an authenticated-but-open route
  that no test notices. `accessControl.enforceGrants: true` turns that
  into a boot failure — **for the routes the planner generates**: CRUD
  bundles (sub-resources included) and operation resources.
  `defineModuleResource` controllers, hand-built resource configs and
  controllers owned by other packages (`MeController`, the
  rockets-server-auth controllers) are never seen by the planner, so a
  passing boot is not a statement about them. It is opt-in because a
  hand-written `AccessControl*` entry in a bundle's `decorators` cannot
  be detected at plan time — the CRUD controller is built downstream, so
  the metadata does not exist yet. Both limits, and the reason `acl` and
  manual grant decorators are mutually exclusive rather than merged, are
  in `CONFIGURATION.md` §5a.

  The `CanAccess` service is stamped per ROUTE, never on the controller.
  Upstream merges query metadata across class and handler and breaks on
  the first service returning `true`, class-level first — so a
  class-level default plus a method-level override is an OR in which the
  permissive service wins, and an operation could never tighten. One
  entry per route is what makes `acl: { action, query }` an override.

  A non-CRUD write must name its action: `POST /pets/:id/transfer` is an
  update, not a create, so `op.write` has no default and throws without
  one. `public: true` together with a grant also throws — a public route
  has no user to resolve roles from, so the grant could only ever 403.
  Sub-resources do not inherit the parent's `acl.resource`; they declare
  their own. Rules stay app-owned — this wires decorators and
  registrations, it does not generate `acRules` or decide possession.

  **Type-level breaking change:** `CrudResource` and `OperationResource`
  gained a required `acl` field. Bundles built by `defineResource` /
  `defineSubResource` / `defineOperationResource` are unaffected; a
  hand-constructed bundle object must add it.
- **Per-operation `input` / `output` on `zodResource` / `zodSubResource`
  (issue #57).** The zod path had a single schema-derived projection, so
  an app chose between controlled projection and automatic OpenAPI. Each
  CRUD operation now takes its own `input` / `output` **schema**, compiled
  through the same pipeline as the derived DTOs (Standard Schema
  validation + named OpenAPI components `<Name><Op>InputDto` /
  `<Name><Op>OutputDto`). Overrides replace the projection rather than
  merging with it. `input` on an operation with no request body, and
  `output` on a `delete`/`restore` that answers `204`, throw at definition
  time instead of being dropped on the wire. Documented in the core
  README (Zod-first resources → "Per-operation `input` / `output`").
- **Pluggable error envelope (issue #55).** `RocketsCoreExceptionsFilter`
  hardcoded `{ statusCode, errorCode, message, timestamp }` and kept its
  unwrap helpers private, so an app with its own envelope re-implemented
  the whole filter — and had to preserve the `context.originalError`
  chain while doing it, because missing it turns every hook `409` into a
  `500`. The body shape is now a strategy:
  `RocketsErrorSerializerInterface`, passed as the filter's second
  constructor argument or provided under
  `ROCKETS_ERROR_SERIALIZER_TOKEN` when the filter is registered through
  Nest. `defaultErrorSerializer` is exported so a custom envelope can
  extend it. Status resolution, the domain-exception → 4xx mapping and
  the unwrap chain stay in the filter deliberately; the two unwrap
  helpers became `protected` for subclasses that need more than the body.
  Default output is unchanged.
- First-class Standard Schema support for hand-written core controllers via
  `@concepta/rockets-core/standard-schema`, with typed request/response DTO
  carriers, opt-in native Nest validation and serialization, plus a dedicated
  Swagger subpath. Existing generated CRUD/Zod serialization remains
  unchanged.
- Firestore adapter transactions (issue #44 P1-1): `runInFirestoreTransaction` /
  `FirestoreRepository.transaction` (callback-scoped, retry-safe),
  `FIRESTORE_BACKEND` DI export, `transactionFactories` + `options.ctx`
  threading, transactional duplicate-id → 409 mapping, and `limit()` on
  transactional queries. Contended RMW must use the callback API.
- Firestore soft-delete server pushdown (issue #44 P1-4): default lists/counts
  use `field == null`, restoring `limit()` / aggregation. **Requires a data
  backfill and composite indexes before deploy** — see the package CHANGELOG.
  Includes `backfillSoftDeleteNull` / `adminStreamBackfillSoftDeleteNull` +
  `firestore.indexes.example.json`. Nested `runInFirestoreTransaction` joins
  the ambient handle on the same backend and refuses to span backends.
- Firestore P1 follow-ups: `firestoreIncrement` + write preconditions (P1-2),
  `uniqueDocumentIdField` with boot-time refuse of composite unique (P1-3
  tier 1), inequality `orderBy` reconcile (P1-5), WriteBatch `createMany` /
  `deleteMany` (P1-6), and enforced 500-write transaction limit.

### Changed

- **`operationResource` rejects a non-object request payload (issue #43).**
  With an `input` declared, an array, a scalar, or a non-plain object now
  returns `400` instead of being narrowed to `{}`. `POST []` against
  `z.object({ note: z.string().optional() })` previously returned `200`
  with an empty input, and the same narrowing bypassed an all-optional
  class-validator DTO. A missing body still becomes `{}`, so a `POST`
  with no payload against an all-optional input is unchanged.
- **Two generated DTOs claiming one OpenAPI component name fail at
  boot.** Operation ids keyed off an underscore slug while DTO names
  pascal-cased, so `foo-bar` and `fooBar` received distinct ids and one
  component name — the second schema silently replaced the first in the
  generated document. Both now derive from one namer, and the planner
  asserts the result. The check compares class identity, so reusing one
  compiled DTO across several operations stays legal.
- **A directly imported `DynamicModule` no longer loses its host class's
  static exports**, and a re-exported host no longer loses its dynamic
  ones. Nest's scanner unions the two halves; only one was modelled, on
  each path, so a handler published by the other half was re-registered
  locally and could not resolve its module-private dependencies.
- **Per-operation `output` now actually reaches the route (issue #57).**
  `defineResource` accepted `operations.<op>.output` but upstream reads
  `response.resource` / `response.paginated` from the CONTROLLER only —
  `CrudList` / `CrudRead` / … consume nothing but `response.serialization`
  from their per-operation options. An `output` that differed from the
  resource default was therefore accepted, documented nowhere, and
  serialized with the resource-level DTO. Both metadata keys are declared
  `MethodAndClass` upstream and resolve method-first, so `buildOperation`
  now stamps them on the route; a `list` override additionally derives its
  matching paginated wrapper. The guard that forced
  `operations.read.output` and `operations.list.output` to be identical
  existed only because of this gap and is gone — `read.output` is the
  resource-level fallback when `dto.response` is not declared.

  **Upgrade-visible.** A resource that already declared
  `operations.create.output` (or `update` / `replace` / `delete`) with a
  DTO different from its resource-level response was silently serializing
  the resource-level one; that route's response body now changes to the
  declared DTO. Nothing errors — check any per-operation `output` you
  have before upgrading. `operations.list.paginated` declared without an
  `output` was likewise dropped and now takes effect; declaring it on any
  operation other than `list` throws, since nothing else serializes a
  collection.
- CI: `ci-pr-test` and `release-readiness` no longer filter on a `main` base,
  so stacked pull requests are gated (including the Firestore emulator suite).

### Removed

- **`RocketsAuthExceptionsFilter` — dead code, and the auth e2e helper
  was its only caller (issue #87).** No application's behaviour changes.
  The filter was never in `rockets-server-auth`'s `src/index.ts` and the
  package's `exports` map has no deep-import subpath (only `.` and
  `./package.json`), so no consumer could import it;
  a repo-wide sweep found zero references outside
  `__e2e__/helpers/rockets-auth-e2e-app.factory.ts`. Its own
  `RuntimeException` branch was unreachable too — a double import made
  both `instanceof` checks resolve to the same class — and the reachable
  half duplicated upstream's filter. So the real defect was in the
  TESTS: the auth e2e app ran a filter no real app ran, which is why
  `details` (#55) looked unreachable from auth. The helper now
  registers `RocketsCoreExceptionsFilter` — what
  `examples/sample-server-auth` and every other consumer already use —
  and takes an optional serializer, so the suite exercises the
  production path. `rockets-auth-error-details.e2e-spec.ts` pins it:
  `details` reach an auth-composed app under
  `detailedErrorSerializer`, the default envelope stays byte-shape
  identical (all four keys asserted), and a 5xx still masks them —
  proven on a synthetic route AND on `PATCH /me`, whose
  `whitelistedFromDto` call is the one production site that mints
  details on a route a consumer actually calls.

  **Two limitations found while writing that coverage.** Stated rather
  than papered over; neither is introduced by this change.

  *Invitation acceptance swallows errors.* The other production minter
  — the invitation-acceptance listener — cannot surface details, or any
  error, over HTTP. Its event is published from an `onCommit` callback
  flushed with `Promise.allSettled`, `AggregateRoot.commit()` is a
  synchronous `void`, `EventBus.bind` swallows handler exceptions, and
  the listener catches to honour the event-listener contract.
  `PATCH /invitation-acceptance/:code` therefore returns `200` whenever
  metadata validation throws — for ANY reason, not only a bad payload —
  leaving the metadata unwritten with only a log line. Three of those
  four barriers are upstream.

  *`PATCH /me` is unusable with an undecorated metadata DTO (issue
  #103).* `whitelistedFromDto` validates with `forbidUnknownValues:
  true`, and class-validator rejects a target carrying no validator
  metadata outright. `RocketsAuthUserMetadataDto` — the documented base
  extension point, and the auth e2e helper's default — has `@Expose()`
  / `@ApiProperty()` but no constraints, so `MeController.updateUser`
  returns `400 "an unknown value was passed to the validate function"`
  for EVERY payload, `{}` included. Every existing `/me` spec in
  `rockets-server` supplies a decorated DTO, and `rockets-server-auth`
  had no `PATCH /me` coverage at all, which is why a green suite hid
  it. Now pinned by a regression test asserting the broken behaviour;
  the fix is a semantic decision on a shared core util and is tracked
  separately.
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

- **The non-CRUD transaction seam is documented (issue #60).**
  `CONFIGURATION.md` §8a explains what a repository call without `ctx`
  actually does — runs hook-free AND outside the operation's transaction
  — with the adapter/resolver chain that causes it, copy-paste examples
  for hooks, CQRS handlers and custom services, what `propagation` does
  and does not control (`run()` starts no transaction by itself, and the
  default `SUPPORTS` fails open when no transaction-capable adapter is
  registered), why a guard cannot join the operation's transaction, and
  the `grep` sweep that found the original defect. Cross-linked from the
  core README's dynamic-repository how-to —
  whose own example omitted `ctx`, teaching the anti-pattern — and from
  `AGENTS.md` rule 16. Root cause of #45; cost the field report ~45
  minutes of source spelunking.

- `SECURITY.md` and sample READMEs no longer claim an npm `alpha` channel that
  is not published yet.

### Public API governance

- `api/public-api-reports.json` records the declaration-level contract for
  every published entry point, distinguishing runtime from type-only exports
  and including same-package declarations reachable through public signatures.
  `yarn api:report:check-built` gates it in CI.
- Removed the unused pre-1.0 aliases
  `ROCKETS_MODULE_OPTIONS_DEFAULT_SETTINGS_TOKEN` and
  `RocketsAuthUserMetadataCreateDtoInterface`; use
  `ROCKETS_CORE_SETTINGS_TOKEN` and
  `RocketsAuthUserMetadataCreatableInterface`, respectively.

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

- **Entity hooks bound to a key no resource registers now fail the boot
  (issue #69 review).** `@EntityHook({ entity })` bakes
  `deriveEntityKey(entity)` into its spec, while the repository adapter
  stamps the resource's REGISTRATION `key` onto the hook context — and
  matching is an exact string compare. `defineResource({ entity:
  PetEntity, key: 'pets' })` therefore registered the entity as `pets`
  while a hook on that same resource matched `pet`: the hook silently
  never fired, nothing warned, the app booted clean, and for
  `TenantScopeHook`/`OwnerScopeHook` that is a total fail-OPEN — every
  actor sees every tenant's rows. `buildAppRegistrationPlan` now runs
  `validateEntityHookBindings`, which rejects the mismatch at boot naming
  the hook, both keys, and both remedies; a hook bound to an entity no
  bundle registers is rejected too. Sibling helpers (`defineHook`,
  `AfterCreateReloadHook`) already failed loudly on the same mismatch via
  an unresolvable `@InjectDynamicRepository` token — scoping hooks have no
  such dependency, which is exactly why they needed this. For a resource
  that must keep a custom `key`, `EntityHookOptions` (and
  `TenantScopeOptions`) gained `entityKey` to bind the hook to the key in
  use. Scope: generated CRUD bundles — resource-level `hooks`,
  per-operation `operations[op].hooks`, and sub-resources. Hooks
  registered as bare providers on a `defineModuleResource` slice, or
  applied by a hand-written `@UseHooks`, are outside what the planner
  sees. `CrudResource.meta` gained `hooks` to carry them to the planner,
  and `getEntityHookBinding(hookClass)` is exported for the same purpose.

- **`hashIdempotentRequest` collapsed non-JSON values, replaying the
  WRONG response (issue #59 follow-up).** The walker's generic-object
  branch read `Object.keys(value)`, which is `[]` for a `Date` — so
  every date serialised to `{}` and two requests differing only by a
  date hashed IDENTICALLY. The documented pattern hashes `ctx.input`,
  i.e. the post-validation value, where a `z.coerce.date()` field is a
  real `Date`, so a second request under the same idempotency key with
  a different date replayed the first request's stored response instead
  of conflicting. `Map`, `Set` and any class instance with no own
  enumerable keys collapsed the same way, and an undefined-valued key
  (which JSON drops on the wire) hashed differently from its absence,
  409-ing a legitimate retry. The walker now honours `toJSON()` first,
  handles `Map`/`Set`/`bigint` explicitly, ignores undefined-valued keys
  like JSON does, and THROWS — naming the offending path — on anything
  it cannot represent faithfully, rather than emitting a placeholder.
  `toJSON` output is TAGGED with the constructor name (a `Date` and the
  ISO string of that date no longer collide), and the walk is bounded by
  a depth cap and a cycle guard, so a deeply nested or self-referencing
  body raises the same named error instead of a `RangeError` 500.

- **A valid webhook signature with garbage appended was ACCEPTED.**
  `Buffer.from(x, 'hex')` decodes greedily and stops at the first
  invalid pair, so `<digest> + "ZZZZ"` decoded to exactly the digest's
  bytes, passed the length guard, and verified true. Not forgeable — an
  attacker still needs the real digest — but a signature with infinitely
  many valid spellings is malleable, and anything keyed on the header
  value inherits that. The header's shape is now validated before
  decoding.

- **Webhook signature verification swallowed configuration faults.** The
  `try/catch` around the digest documented an impossible condition
  (`Buffer.from(x, 'hex')` does not throw — it truncates, and the length
  guard is what rejects a malformed header) while silently turning the
  faults `createHmac` DOES throw on — an empty/missing secret, an
  unsupported algorithm — into `false`, i.e. a permanent 401 with
  nothing in the logs. Those now throw; only bad signatures return
  `false`. `secret` widened to `string | undefined` on both option types
  so `process.env.X` can be passed straight through instead of through a
  `!` the type system cannot check (source-compatible for existing
  callers). A `Buffer` secret — reachable only via a cast — now throws
  where it previously verified.

- **Round-4 review findings.** The module-export walk now merges each
  dynamic host's static and dynamic imports and exports before descending,
  matching Nest's scanner across three-level and cross-half re-export
  chains. Route-audit ids carry version/host qualifiers
  (`GET /widgets [v1]`), so one `allow` entry can no longer exempt a
  public v1 AND a guarded v2 of the same path; an entry matching more
  than one route fails closed. `RouteAuditService` is EXPORTED under the
  same `routePolicy` condition that registers it — registered-but-
  unexported satisfied `app.get()` and failed real consumer DI.
  `FreeFormJson` (and the serialization option constants) are exported
  from the package root the README documents; the e2e now imports them
  through the root barrel so the example cannot drift again.
- **Nested relation leak closed (adversarial review).** The outbound
  serialization options had dropped upstream's `strategy: 'excludeAll'`
  to serve free-form JSON columns — which made an `@Expose()`d relation
  without `@Type()` emit the FULL child row (`owner.passwordHash`)
  where the projection previously yielded `{}` — reachable wherever
  rows are PLAIN objects (Firestore and other plain adapters, JSON
  columns, handler-returned data); TypeORM-hydrated instances emptied
  either way. The strategy is
  restored; `@FreeFormJson` is required on the RESPONSE DTO as well as
  the input, and the leak is pinned by tests that fail if the strategy
  is ever dropped again.
- **`acl` + a manual `AccessControl*` decorator on one operation now
  fails at definition time** (operation resources; CRUD keeps the
  documented plan-time limitation). Grant metadata is last-write-wins,
  so the combination silently REPLACED a possibly tighter hand-written
  grant.
- **The route audit recognises class-level `AccessControlQuery`** —
  upstream enforces it via `getAllAndMerge([class, handler])`, and
  auditing only the handler aborted the boot of correctly-enforced apps
  under `requireAclQuery`.
- **CRUD-vs-CRUD route collisions are checked in operation-free apps**
  — an early return had gated the whole check on "any operation bundle
  exists", so two CRUD bundles claiming one route booted clean until an
  unrelated operation resource joined the app.
- A throwing custom error serializer falls back to the default envelope
  instead of replacing every error response with the adapter's bare 500.
- Nested class-validator failures on operation inputs name the failing
  field (`child.street: ...`) instead of answering `message: []`.
- Hidden-by-read-hook columns no longer reappear on create responses
  (`AfterCreateReloadHook` now drops keys the read view removed).
- Route-collision analysis matches Express's case-insensitive routing;
  handlers with request-scoped dependencies resolve `REQUEST` correctly;
  an uninspectable (throwing) `forwardRef` import refuses handler
  auto-registration loudly instead of risking a silent duplicate;
  `path-to-regexp` is pinned exactly to the router's own version.

- **Duplicate `typeorm` copies now fail with an actionable error
  (issue #70).** `@nestjs/typeorm` uses the `DataSource` **class object
  itself** as its default DI token, so a second copy of `typeorm`
  registers the provider under one token and looks it up under another —
  surfacing only as `Nest could not find DataSource element`, with
  nothing pointing at the cause. `defineTypeOrmRepository().forRoot()`
  now compares the `DataSource` it resolved against the token
  `@nestjs/typeorm` will use and, on a mismatch, names the loaded copies
  and the dedupe command. Exported as `assertSingleTypeOrmInstance()` /
  `hasSingleTypeOrmInstance()` for apps that want to fail earlier.

  The dependency half of that issue was already satisfied — `typeorm` and
  `@nestjs/typeorm` are peer dependencies in this package and in
  `@concepta/nestjs-repository-typeorm` upstream, with no hard
  `dependency` on either anywhere in the chain. A unit test now pins that
  so it cannot regress into a hard dependency.
- **Free-form JSON columns were destroyed on the WRITE path (issue #68).**
  The report described this as a response-serialization problem
  ("persisted correctly, the response strips it"). It is not: the blob
  never reached the database. Bisecting one request — raw body at a
  global interceptor, the DTO at the CQRS command, the payload at a
  `beforeCreate` hook, and the stored row read back — showed the body
  arriving intact and already `{}` by the time the command was built,
  while writing the same blob straight through the repository
  round-tripped perfectly. Every response-side change therefore had no
  effect, because there was nothing left to return.

  The destructive option is `strategy: 'excludeAll'`, not
  `excludeExtraneousValues`. `excludeAll` is recursive: it walks into a
  plain-object property, finds no per-key `@Expose`, and yields `{}`.
  `excludeExtraneousValues: true` alone still drops undeclared top-level
  keys and still projects nested `@Type(() => ChildDto)` properties, so
  the whitelist that makes a response DTO a projection is intact without
  it — verified against both cases.

  Two changes: the CRUD serialize interceptor now runs with
  `excludeExtraneousValues` only inbound and `exposeAll` outbound
  (`ROCKETS_TO_INSTANCE_OPTIONS` / `ROCKETS_TO_PLAIN_OPTIONS`, both
  passed because the settings provider replaces rather than merges), and
  `@FreeFormJson()` marks a property on an **input** DTO so the request
  body survives the ValidationPipe, whose transform options are not
  reachable through the resource config.

  The zod path was never affected: it compiles DTOs from the schema, so
  it already applies the equivalent passthrough for
  `ZodRecord`/`ZodUnknown`/`ZodAny`. A raw `z.record()` is absent from
  zod responses by the deliberate opt-in rule, not by this bug — declare
  `dto: { response: true }` on the field.
- **Sub-resource path scoping ignored the parent's own read hooks (issue #45).**
  `PathScopeGuard` looked the parent up without a repository `ctx`, which
  disabled every hook on that call. A parent hidden by one of its own
  `beforeFindOne` / `afterFindOne` hooks (soft expiry, retention, tenant
  scope) stayed fully reachable through its children: `GET`, `POST` and
  `DELETE` on the nested route all succeeded where the parent's own routes
  returned `404`. The guard now replays the parent resource's `hooks` on a
  detached context that presents the lookup as the parent's OWN read —
  `entity`, `operation: Read`, and the request's route params with `id`
  bound to the row being looked up. The CRUD context is load-bearing, not
  decoration: a hook gated on `getCrudContext(ctx)` (the shape this
  codebase documents) fails OPEN without it, and so does the framework's
  own `PathScopeHook` when a grandchild's guard replays it.
  `PathScopeGuard.for()` takes optional fifth/sixth `parentHooks` /
  `parentSelect` arguments; `defineResource` passes them automatically.
  Documented in `CONFIGURATION.md` §5 ("Which parent-side hooks run during
  path scoping").

  Three consequences are called out there and are worth reading before
  upgrading: a parent hook that **throws** now surfaces on nested routes
  (it never fired there before, and a `Before*` throw reaches the client
  as a `500` through the upstream membrane); the lookup reads the **full
  parent row including eager relations** whenever the parent declares
  hooks, with the new `parentSelect` on `defineSubResource` as the
  opt-out; and `owner: false` drops the guard entirely, so a sub-resource
  that opts out of the ownership check also opts out of parent-side
  visibility. Guard lookups still run before the operation transaction —
  Nest executes guards ahead of interceptors — which is now stated rather
  than implied.
- **`AfterCreateReloadHook` reloaded outside the create's transaction.**
  It called `findOne` with no `ctx`, so `getRepo(ctx)` on the TypeORM
  adapter returned the DEFAULT repository instead of the transaction's —
  a different `EntityManager`. Under `transactional: true` the row is
  still uncommitted, so on any driver that gives a transaction its own
  connection (Postgres, MySQL) the reload found nothing and the eager
  relation silently vanished from the create response. In-memory SQLite
  shares one connection, which is why the existing e2e suite could not
  see it. The hook now forwards its `ctx`, which also means the reload
  runs the entity's own read hooks — so the create response shows what a
  read would show, and a column a read hook hides no longer reappears on
  the way out of a create.
- **Three-level (and deeper) sub-resource nesting returned `500`.** The
  composed `request.params` for a nested sub-resource declared only its
  own `id` and its immediate parent's param, so the upstream query parser
  rejected the grandparent's `:param` with "Error on crud context
  processing". Ancestor params are now declared `disabled: true` —
  validated as route params, but not turned into filters, since only the
  immediate parent's param is a FK column on the entity.
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
