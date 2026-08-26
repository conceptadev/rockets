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

- **`op.sse()` — Server-Sent Events on `operationResource` (issue #52,
  v1).** A new builder alongside `op.read`/`op.write`/`op.delete`: same
  resource, same auth/`public`/`acl`, same query-param validation, but
  the handler returns an `Observable<MessageEvent>` and there is no
  `output` to declare — the response body IS the stream. One
  `responseMode` seam in the generated controller applies Nest's native
  `@Sse()` instead of `@Get()` and skips the JSON output-DTO step;
  everything upstream (guards, ACL, input validation) is the exact same
  pipeline every other operation runs — a throw there happens before the
  SSE response controller is reached, so no headers are sent and the
  client gets an ordinary JSON error. That ordering is a property of
  Nest's router, not of a test; the e2e covering it (an unauthenticated
  request getting a `401` with no `text/event-stream` response) is a
  regression net over this seam, not an independent proof that the
  handler never runs. Neither `output` nor `transactional` is exposed on
  this builder — a never-completing connection is not something to hold
  a database transaction open across. **Every** generated operation now
  has its registered route metadata read back after all decorators have
  run and compared against the declared `method`/`path`, throwing at
  definition time when they disagree; SSE adds its own rules on top
  (`GET`-only, no `output` DTO, no `Transactional()` — on the operation
  or the resource — and no `@Sse()` smuggled onto a JSON op). Without
  that read-back, `decorators: [Post('x')]` won the `METHOD_METADATA`
  slot (`applyDecorators` runs in order, last write wins) and produced a
  POST route still in SSE response mode, while `decorators: [Get('b')]`
  moved only the path — both invisible to the duplicate-route and
  planner collision checks, which read the declared values. A mid-stream
  failure is masked the way `RocketsCoreExceptionsFilter` masks a 5xx
  JSON body, over the same **unwrapped** exception (the filter's chain
  walkers are now exported and shared, so a hook's `403` wrapped in a
  `RepositoryQueryException` is still a `403` and not a masked `500`):
  `HttpException` and `safeMessage` text pass through, anything else
  becomes `Internal Server Error` with the real error logged
  server-side. This is needed because once headers are committed Nest
  writes `err.message` straight to the wire and never reaches that
  filter. HTTP Range/partial-content support
  (the rest of issue #52) needs genuinely new plumbing with no precedent
  in this codebase and is a deliberate follow-up, not part of this PR
  (issue #101). See `CONFIGURATION.md` §6c.

- **Pinned OpenAPI contract export (issue #54).** Both example apps now commit
  a `contract.json` — the exact OpenAPI document each one serves — with an e2e
  spec (`test/openapi-contract-export.e2e-spec.ts`) that regenerates it under
  `CONTRACT_UPDATE=1` and otherwise diffs it byte-for-byte, so an unintended
  wire-contract change fails on the PR instead of shipping silently.
  `examples/sample-server` covers the zod half of the acceptance criteria
  (`zodResource` CRUD, `zodSubResource`, `operationResource` ops);
  `examples/sample-server-auth` covers the class-based `defineResource` +
  built-in auth surface. Regenerate with `yarn sample:contract:export` /
  `yarn sample-auth:contract:export`, verify with the matching
  `contract:check` scripts — each builds the workspace and the example first,
  so a contract can't be pinned from stale `dist`. No new CI workflow was
  needed: `release-readiness.yml`'s `release-gates` job already runs
  `samples:test:e2e` on every PR, so drift is visible before merge (that job
  is not a GitHub *required* status check — `main` has no branch protection —
  so it reports rather than blocks). The artifact is serialized with canonical
  (sorted) key order: `SwaggerModule`'s property-assignment order is not
  stable across toolchains (an enum query parameter emits `{"type","enum"}`
  under vitest/swc and `{"enum","type"}` under ts-node/tsc), so a raw
  `JSON.stringify` pin would report drift on an unchanged API. See
  `CONFIGURATION.md` §6b.

- **`SwaggerUiService.createDocument(app, documentOptions?)`.** Builds the
  OpenAPI document without mounting the UI, and `setup()` now routes through
  it — so an exported contract artifact is the served document by
  construction. Each example app wraps its real document-building steps
  (`extraModels`, the PATCH `/me` patch, nestjs-zod `cleanupOpenApiDoc`) in a
  single `src/swagger/create-openapi-document.ts` helper that `main.ts` and
  the contract specs share, instead of each re-deriving the bootstrap.

- **Per-route rate limiting (issue #56).** `@RateLimit({ limit, windowMs })`
  marks a route; `RateLimitGuard` enforces it — a route without the
  decorator is untouched. Allowed requests get `X-RateLimit-Limit` /
  `X-RateLimit-Remaining` headers; over-limit requests get `429` with
  `Retry-After`; a broken store fails **closed** (`503`), never lets a
  request through unlimited. Ships one reference adapter,
  `InMemoryRateLimitStore` (single-process — a real multi-instance
  deployment needs a shared backend behind `RateLimitStoreInterface`).
  `CONFIGURATION.md` §7c documents that shared-backend store and why
  the obvious read-increment-write counter row is wrong *through the
  base contract*: it loses concurrent increments, and holding a
  transaction per request instead makes overlapping requests collide
  rather than merely queue. The documented store appends one row per
  attempt and derives the attempt's rank from its own generated id —
  no raw SQL and no ORM-specific primitive. It is covered by an e2e
  that fires 10 concurrent requests at a `limit: 2` route on real
  SQLite and asserts exactly 2x`200`, 8x`429`, zero `503` and 10
  persisted attempt rows, plus a window-refill test so a store that
  banned a key permanently could not pass.

  §7c states the shape's limits rather than implying it is universal:
  exactness follows from single-writer commit ordering (SQLite), while
  a pooled Postgres/MySQL can over-admit by the in-flight concurrency;
  the rank needs monotonic comparable generated ids, so it is wrong on
  the Firestore adapter's `randomUUID()` keys (use that adapter's
  native `increment()` there); the `COUNT` is O(rows in window) and
  every rejected request still commits a row, so a route facing real
  hostile volume belongs on Redis. Aligned fixed windows admit up to
  `2 x limit` across a boundary and are sensitive to clock skew.

  §7c also now documents global-guard ordering (a guard registered
  ahead of `RateLimitGuard` hides its rejections from the limiter) and
  the `trust proxy` requirement behind the default `ip:METHOD:route`
  key.

- **Session-cookie auth, CSRF, and the ternary route policy (issue
  #58).** `AuthSession()` marks a route session-cookie authenticated —
  the third leg alongside `AuthPublic()` ("public") and no decorator
  ("internal"). `CsrfGuard` enforces the CSRF double-submit check
  (`x-csrf-token` header must equal `HMAC(secret, sessionCookieValue)`)
  on `POST`/`PUT`/`PATCH`/`DELETE` to `@AuthSession()` routes; it
  no-ops on every other route, so a bearer-only app that registers it
  anyway sees no behavior change. `generateCsrfToken` /
  `verifyCsrfToken` (timing-safe) and `parseCookies` / `extractCookie`
  are the supporting primitives. `RouteAuditEntry` gained
  `sessionAuth: boolean`, and the route policy gained **`requireCsrf`**,
  which fails the boot when a `@AuthSession()` route exists and no CSRF
  guard is registered (`CsrfGuard` by identity, or a class named in the
  new `routePolicy.csrfGuards`) — without it the decorator is inert
  metadata and an app can mark every session route while enforcing
  nothing. Declaring `AuthPublic` and `AuthSession` on the same handler
  throws at route-audit collection time — a public route has no session
  to protect — but note both that check and `requireCsrf` run only when
  the app declares a `routePolicy`; the audit is not collected
  otherwise. `@concepta/rockets-adapter-firebase`
  gained the session-cookie capability the field report (#46) found
  missing: `FirebaseSessionCookieAdapter` (the session counterpart to
  `FirebaseAuthAdapter`, coexisting in the same `auth` chain) and
  `FirebaseSessionCookieVerifierInterface` (`verifySessionCookie` /
  `createSessionCookie`) as a SEPARATE interface from the bearer-only
  `FirebaseTokenVerifierInterface`, so an existing bearer-only custom
  verifier does not break at compile time. See `CONFIGURATION.md` §7c.

  **Security review follow-ups, folded into the same change (all with
  falsifying tests — each fix was reverted to confirm its test goes red):**

  - `FirebaseSessionCookieAdapter` now forwards `checkRevoked` to
    `verifySessionCookie`, and `sessionCookie.checkRevoked` **defaults
    to `true`** — deliberately unlike the bearer `checkRevoked`
    (`false`). It previously passed no options, so the underlying
    firebase-admin revocation lookup never ran and a revoked session
    cookie — or a disabled user's — kept working for its full 14-day
    lifetime. `auth/user-disabled` now maps to
    `FirebaseSessionCookieRevokedException` alongside
    `auth/session-cookie-revoked`.
  - `verifyCsrfToken` rejects anything that is not exactly 64 hex
    characters before decoding. `Buffer.from(s, 'hex')` truncates at
    the first non-hex character rather than throwing, so a valid token
    with arbitrary garbage appended decoded to the expected bytes and
    verified as valid — a token the function had never minted. The
    unreachable `try/catch` it relied on is gone.
  - `CsrfGuard` validates `secret` and `sessionCookieName` in its
    constructor, so a misconfigured deployment fails at boot rather
    than on the first protected request (`undefined`) or never at all
    (`''`, a legal HMAC key that produces a forgeable token). As part
    of that guard's initial shape, `secret` must be a non-empty string
    of at least 32 characters — the exported
    `MIN_CSRF_SECRET_LENGTH` floor; generate one with
    `openssl rand -hex 32`. (`CsrfGuard` is introduced by this same
    unreleased entry, so this is the contract it ships with, not a
    change to a released one.)
  - `CsrfGuard` lower-cases `headerName` before reading it. Node
    lower-cases every inbound header name, so the conventional
    `headerName: 'X-CSRF-Token'` matched nothing and rejected every
    state-changing session request — a guaranteed outage that failed
    closed and so never looked like a bug.
  - `parseCookies` resolves duplicate cookie names **first-wins**,
    matching the `cookie` npm package and the rest of the Node
    ecosystem; it was last-wins. An attacker able to plant a second
    `__session` cookie (sibling-subdomain cookie tossing, a
    path-scoped cookie) could make this parser and any other
    cookie-reading layer in the same app disagree about who is
    authenticated. The cookie map is also null-prototype now, so a
    cookie named `toString` or `__proto__` is data like any other.

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

- **A route that declares a schema and validates nothing no longer boots.**
  Nest installs no validator for `@Body/@Query/@Param({ schema })`; a
  hand-written route missing its `StandardSchemaValidationPipe` documented
  the body in OpenAPI and let anything through. Core's route audit now runs
  in every app (policy or not) and fails the boot as `requireSchemaPipe`,
  naming the controller, handler and parameter. `RouteAuditService` is
  always registered and injectable; the policy rules stay opt-in.
- **Hand-written auth request bodies keep their component names.** The
  `rockets-auth` login, refresh and recovery bodies are `$ref`'d as
  `LocalLoginDto`, `RefreshDto` and `Recovery*Dto` in the document again;
  upstream ships those schemas without an id. Generated CRUD bodies
  (`/signup`, admin routes) stay inline — the documented upstream gap.
- **A create body that validates to `{}` is a valid create.** Generated
  resources run on `RocketsCrudAdapter` (exported from core), which keeps
  upstream's params merge and drops the bare `400` upstream's adapter
  answered to an empty validated payload. A sub-resource whose every
  column is server-stamped (`PathScopeHook`, `OwnerStampHook`, a consumer
  hook minting ids) now accepts `POST {}` — the behaviour the class-DTO
  era only delivered by accident (`class-transformer` left declared
  fields present as `undefined`).
- **Invitation acceptance never forwards unvalidated `userMetadata`.**
  With no app metadata schema configured, `rockets-auth` now applies the
  same base default as signup and admin (strip every key) instead of
  passing the record through — a smuggled `userId` can no longer rewrite
  the metadata row's owner.
- **Hand-written routes on the native engine; legacy validators removed (RFC
  #104, stage 6).** The last class DTOs are gone: `rockets-auth`'s OTP,
  change-password, invitation revoke / acceptance-payload and admin
  role-assignment bodies are named zod schemas validated by each
  controller's own Standard Schema pipe (the invitation-acceptance
  `payload` is now validated — a short password or a non-object
  `userMetadata` is a `400`); `examples/sample-server`'s pet-share and
  `examples/sample-code-review`'s DTOs likewise. `class-validator`,
  `class-transformer` and `nestjs-zod` are removed from every Rockets
  manifest (no peer, no dependency) — except that `@concepta/rockets-auth`
  keeps `class-validator` / `class-transformer` as plain dependencies while
  `@concepta/nestjs-email` / `nestjs-event` (7.x) pull `nestjs-common@7`,
  which requires them at import; `compileDtoClass` / `namedZodDto` are
  gone from `@concepta/rockets-core/zod`. Migration: delete any global
  `ValidationPipe` you registered only for Rockets DTOs (a global
  class-validator pipe is harmless but dead; a global
  `StandardSchemaValidationPipe` is rejected at boot); annotate body
  params with `z.output<typeof schema>`, never a class.
  Also in `examples/sample-server`: the reminder and pet-share scope hooks
  now forward `ctx` to their repository lookups (rule 16 — the lookups ran
  hook-free and outside the operation's transaction).
- **`operationResource` on the native engine (RFC #104, stage 5).** The
  generated controller carries a class-level
  `StandardSchemaValidationPipe(rocketsSchemaValidation)`; the body is
  `@Body({ schema })` (a named `<Base>Input` component behind a payload-shape
  guard: missing body → `{}`, array / scalar / `Buffer` → `400` naming the
  whole body), the query `@Query({ schema })` and the resource `params`
  `@Param({ schema })` (both documented one parameter per property; extra
  Nest path params still reach `ctx.params`). Responses are validated
  inline by the named `<Base>Output` schema (`null` / mismatch → `500`) and
  documented with `ApiResponse({ standardSchema })`. Compiled descriptors
  carry `inputSchema` / `paramsSchema` / `output` schemas instead of DTO
  classes; component-id uniqueness across CRUD and operation resources is
  one planner check. Removed: class-validator DTO support on
  `defineOperationResource`, `classValidatorErrorsToDetails`, the
  generated-DTO brand.
- **One schema engine — upstream `@concepta/nestjs-*` `8.0.0-alpha.9`, Nest
  `12.0.0-alpha.6`, `zod` 4.4.3 (RFC #104, stage 4).** Every request body and
  every response in Rockets is now a **named zod schema**
  (`withOpenApi(schema, 'ComponentName')`, re-exported from
  `@concepta/rockets-core`) and one engine serves generated CRUD,
  `defineResource`, `/me` and `rockets-server-auth`:
  - **Validation**: Nest's native per-route `StandardSchemaValidationPipe`,
    configured with `rocketsSchemaValidation` so every `400` carries
    structured `details[]` (issue #55) — on CRUD routes, the `/me` PATCH,
    the auth token / recovery / invitation routes.
  - **Serialization**: upstream serializes CRUD responses through the
    response schema (`~standard.validate`): undeclared row columns never
    leave, `Date` columns become ISO strings, a computed field is validated
    against the schema that documents it. A CRUD route without a response
    schema is a boot-visible `500`, not an unprojected leak.
  - **OpenAPI**: from the schema's own JSON Schema bridge; `SwaggerUiService.createDocument`
    installs a Rockets converter that `$ref`s every named schema as
    `components/schemas/<id>` (ids keep the old DTO class names:
    `TagResponseDto`, `TagCreateDto`, `TagResponseDtoPaginatedDto`, …).
    Two different schema instances claiming one id fail at plan time and
    at document time. `strictInput` emits `additionalProperties: false`
    natively — no `cleanupOpenApiDoc`.
  - **`defineResource`**: `dto.{response,paginated,create,update,replace}` and
    per-operation `input` / `output` / `paginated` are named schemas
    (`assertNamedSchema`, response fail-closed); `paginated` derives as
    `${responseId}PaginatedDto`.
  - **`userMetadata`** is `{ entity, updateSchema, responseSchema, repository? }`
    — exactly what `defineZodUserMetadata` returns; `createDto` had no consumer.
  - **`/me`** is `buildMeController(config)` (factory): PATCH validates
    `{ userMetadata?: UserMetadataUpdateDto }`, both routes serialize through
    `UserResponseDto` (hidden userMetadata columns stay hidden), and
    `userMetadata` is `null` before the first PATCH (was `{}`).
  - **Dates**: `f.createdAt()` / `f.updatedAt()` / `f.deletedAt()` are
    `z.date()`; new `f.date()` (`z.coerce.date()`) for writable datetimes; a
    response-exposed `z.iso.datetime()` is rejected at definition time (rows
    carry `Date`). `WireRow<S>` is the JSON-encoded output (`JsonEncoded<T>`),
    `SchemaPersistenceRow<S>` is `z.output<S>`.
  - `zodResource(...).zod.schemas` (`{ request, response }`) replaces `.zod.dtos`;
    `f.compute` returns `z.output<schema>`.
  - A **global** `StandardSchemaValidationPipe` is rejected at boot
    (`SchemaValidatorConflictCheck`): Rockets routes carry their own, a global
    one validates every body twice. `realtystack`: delete the
    `app.useGlobalPipes(new StandardSchemaDtoValidationPipe())` line.
  - No Rockets package imports `@concepta/nestjs-common` any more (it stays
    in the graph at 7.x only through `@concepta/nestjs-email` /
    `nestjs-event`); `mapHttpStatus` (removed upstream) is vendored inside
    the core filter.
  - **Known gap (upstream):** `@concepta/nestjs-crud`'s `CrudInitApiBody`
    stamps generated CRUD request bodies as an inline `ApiBody({ schema })`,
    bypassing the document converter — `${Name}CreateDto` / `UpdateDto` /
    `ReplaceDto` are documented inline, not as `$ref`'d components (responses
    and hand-written `@Body({ schema })` routes are `$ref`'d). Follow-up
    belongs upstream; the runtime contract is unaffected.
    `SwaggerUiService.createDocument` lifts the `definitions` such an inline
    body carries (a nested named schema) into `components.schemas` and
    rewrites the refs, so the served document has no dangling pointer.
  Authoring APIs `zodResource` / `zodSubResource` / `operationResource` / `f.*`
  / hooks / ACL are unchanged.
- **`@nestjs/config` is no longer a Rockets dependency (RFC #104, stage 1).**
  `rockets-core`, `rockets` and `rockets-auth` used it only for
  `registerAs` + `ConfigModule.forFeature` to hand default settings to
  upstream's `createSettingsProvider`; those defaults are now plain Nest
  providers (`ROCKETS_CORE_SETTINGS_DEFAULTS_TOKEN`,
  `SWAGGER_UI_DEFAULT_SETTINGS_TOKEN`, `ROCKETS_SERVER_SETTINGS_DEFAULTS_TOKEN`,
  `ROCKETS_AUTH_SETTINGS_DEFAULTS_TOKEN`) registered by each module itself.
  Nothing changes for consumers that pass `settings` or run their own
  `ConfigModule`. Reason: the upstream `8.0.0-alpha.9` graph pins
  `@nestjs/config@12.0.0-next.0`, which is ESM-only; a CJS `require()` of it
  from the Rockets dist fails at runtime while `tsc` stays green. The root
  `resolutions["@nestjs/config"]` pin is gone so upstream keeps the version
  it declares. `RocketsModule` (server) no longer reads core's defaults
  namespace — it registers its own empty defaults provider.
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

- **Class-DTO era APIs (RFC #104, stage 4).** `createPaginatedDto`,
  `FreeFormJson`, `ROCKETS_TO_INSTANCE_OPTIONS` / `ROCKETS_TO_PLAIN_OPTIONS`
  (the class-transformer serialization settings), `ZodBodyValidationInterceptor`,
  `whitelistedFromDto` (→ `validateWithSchema(schema, data)`),
  `UserUpdateDto` / `UserResponseDto` / `RoleNameDto` / `UserRoleItemDto`,
  `PersistenceRow`, `ZodResourceDtos`, `MeController` (→ `buildMeController`),
  `ROCKETS_USER_METADATA_DTO_TOKEN`, the unused `BaseUserDto` /
  `BaseUserCreateDto` / `BaseUserUpdateDto` / `BaseUserMetadata*Dto` classes.
  The TypeORM entity compiler no longer
  maps `z.iso.datetime()` to a datetime column (an ISO string field is a
  varchar; `z.date()` / `f.date()` are the datetime columns).
- **`@concepta/rockets-core/standard-schema` and `/standard-schema/swagger`
  subpaths, and the #83 whitelist shim (RFC #104, stage 2).** The subpath
  (`StandardSchemaModule`, `createStandardSchemaDto`,
  `createStandardSchemaResponseDto`, `allowStandardSchemaKeys`,
  `StandardSchemaAwareValidationPipe`, `StandardSchemaDtoValidationPipe`,
  `StandardSchemaResponse`, `ApiStandardSchemaResponse`,
  `withStandardSchemaResponseArrays`, `getStandardSchema`, the DTO brands)
  had no consumer in Rockets or its examples; it duplicated what Nest 12
  ships natively (`@Body({ schema })` + `StandardSchemaValidationPipe`,
  `@SerializeOptions({ schema })`, `ApiResponse({ standardSchema })`).
  Generated DTOs no longer carry `@Allow()` stamps: the stamp only existed
  to survive a foreign `ValidationPipe({ whitelist: true })`, a pipe that
  must not sit in front of schema-validated routes at all (the engine that
  replaces class-validator lands in the next stages).
  `isStandardSchema` / `getCarriedStandardSchema` moved to
  `src/common/utils/standard-schema.util.ts` (internal). Migration: import
  the native Nest pieces instead; annotate hand-written body params with
  the inferred type, never a class; remove any global
  `StandardSchemaDtoValidationPipe`.
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

- **`CONFIGURATION.md` §8a no longer tells readers to pass a propagation
  value that does not exist.** The installed contract is
  `PropagationBehavior = 'SUPPORTS' | 'MANDATORY'`; §8a's custom-service
  example and its adjacent trap note both said `'REQUIRED'`, which is a
  type error. Corrected to `'MANDATORY'` with the behaviour it actually
  has (fails closed when no transaction adapter is registered, rather
  than starting a transaction if none is active). `AGENTS.md` rule 16
  carries the same wrong value and is left for the maintainer.

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
- **`f.date()` rejects `null` and booleans instead of storing 1970.** A
  writable date field answered `201` to `{"expiresAt": null}` and saved the
  epoch; it is now a `400` addressed at the field. ISO strings, numeric
  timestamps and `Date` values still coerce as before.
- **The fail-closed response check reaches every wrapper.** An open
  object (`.passthrough()` / `.catchall()`) hidden inside an intersection,
  tuple, record / map / set value, `.readonly()`, `.catch()` or any other
  wrapper used to pass and ship the whole row; every node that can hold a
  schema is walked now, and a hand-supplied paginated envelope is checked
  too, not only named.
- **Hidden columns stay hidden at every depth of a computed field.** A
  `dto: { response: false }` column nested two or more levels down an
  `f.compute()` shape was still serialized.
- **One OpenAPI component describes one side.** A schema used as both a
  request body and a response is a document-build error now (zod's input
  and output JSON Schemas differ, and last-wins documented one side with
  the other's shape). Give the response its own `withOpenApi()` id.
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

- **`examples/sample-server`: class-vs-zod parity fixtures retired (RFC
  #104, stage 3).** `test/zod-swagger-golden.e2e-spec.ts`,
  `test/zod-parity.e2e-spec.ts` and their hand-written control resources
  (`__fixtures__/tag-classic-control.ts`,
  `__fixtures__/zod-parity/author-book.control.ts`) compared a class-DTO
  `defineResource` twin against the zod resource. With class-DTO authoring
  retired, the twin is gone; `test/zod-library.e2e-spec.ts` keeps every
  document and runtime assertion against the zod author/book pair alone.
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
