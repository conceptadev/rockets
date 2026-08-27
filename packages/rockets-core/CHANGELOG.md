# Changelog

## Unreleased

### Release preparation

- Package manifest set to `1.0.0-alpha.8`; registry publication is
  pending.

### Added

- **`strictInput` on zodResource body operations (issue #79).** Opt-in per-op
  flag that rejects unknown top-level JSON keys with `400` instead of silently
  stripping them. It applies to the derived input projection or an `input`
  override, and is only valid on `create`, `update`, and `replace`.
- **`operationResource` (issue #43 / #50).** Typed non-CRUD endpoints beside
  `zodResource`: Zod input/output → DTO + OpenAPI, generated Nest controller,
  auth/`public`, optional `transactional`, function or injectable `handle`
  handlers. Authoring surface: callback `operations(op)` with `op.read` /
  `op.write` / `op.delete` (method-constrained); path defaults to the operation
  key; `ctx.params` typed from base + op path. **`output` is required** (schema
  or `false`); optional `params` zod validates path params; cross-resource
  route collisions fail in `buildAppRegistrationPlan`. OpenAPI query field types
  come from Zod (`z.toJSONSchema`). Wired through
  `resources[]` as `ResourceKind.Operation`. Operation resources accept
  `acl` at resource and operation level (issue #51); an op with neither
  `acl` nor a manual grant decorator is open to any authenticated user.
  Cursor / SSE / binary / raw JSON /
  idempotency / external-client scaffolds remain follow-ups.
- `compileDtoClass` and `namedZodDto` are exported from the public
  `@concepta/rockets-core/zod` subpath.
- `AuthBootstrapContributions`, allowing an auth integration to carry its owned
  resources, metadata contract, repository, and guard preference.
- `defineAuthAdapter()`, which registers and exports a custom auth adapter from
  a generated host module.

### Changed

- **A `{ schema }` parameter must be reached by a `StandardSchemaValidationPipe`
  — checked at boot.** Nest installs no pipe for `@Body/@Query/@Param({ schema })`,
  so a hand-written route that forgets `@UsePipes(new
  StandardSchemaValidationPipe(rocketsSchemaValidation))` documents the body
  and validates nothing. `RouteAuditService` is now always registered (and
  exported); its `requireSchemaPipe` check runs with or without a
  `routePolicy` and names the controller, handler and parameter. The policy
  rules stay opt-in; `routePolicy.allowUnvalidatedSchema` exempts a route
  validated by a pipe the audit cannot recognise. `RouteAuditEntry` gains
  `unvalidatedSchemaParams`.
- **`RocketsCrudAdapter` is the adapter behind every generated resource.**
  It keeps upstream's params merge and drops the bare `400` upstream's
  `CrudAdapter` answers to a create payload that validates to zero keys:
  the body already passed the input schema, so `{}` is a valid create
  whenever the schema accepts it (all-server-stamped sub-resources).
  Exported for consumers that extend the adapter.
- **Legacy validators removed (RFC #104, stage 6).** `class-validator`,
  `class-transformer` and `nestjs-zod` are no longer peers or dependencies;
  `compileDtoClass` / `namedZodDto` (`/zod`) are gone. The packed-consumer
  check installs no validation library beside `zod`.
- **`operationResource` / `defineOperationResource` on the native engine
  (RFC #104, stage 5).** `CompiledOperationDescriptor.inputSchema` /
  `output` and `OperationResourceDefinition.paramsSchema` are zod schemas
  (`inputDto` / `paramsDto` gone); the generated controller validates
  through Nest's per-route Standard Schema pipe (`operationBodySchema`
  guards the payload shape), validates output inline, documents from the
  schema bridge. `classValidatorErrorsToDetails` and the generated-DTO brand
  are removed; planner component-id uniqueness covers operation schemas.
- **Schema engine (RFC #104, stage 4).** Upstream `8.0.0-alpha.9`, Nest
  `12.0.0-alpha.6`; `zod` is a dependency of the main entry. `defineResource`
  `dto` / per-op `input` / `output` / `paginated` are named zod schemas
  (`withOpenApi(schema, id)`); CRUD bodies validate through Nest's per-route
  Standard Schema pipe with `rocketsSchemaValidation` (`details[]` on every
  `400`); responses are serialized by the response schema; the Swagger
  document `$ref`s named schemas through `createRocketsStandardSchemaConverter`
  (installed by `SwaggerUiService.createDocument`). New exports:
  `rocketsSchemaValidation`, `withOpenApi`, `paginatedSchema`,
  `createBatchSchema`, `assertNamedSchema`, `assertFailClosedResponse`,
  `buildPaginatedSchema`, `readSchemaId`, `isOpenApiBridged`,
  `createRocketsStandardSchemaConverter`, `SchemaValidatorConflictCheck`,
  `validateWithSchema`; zod subpath: `f.date()`, `buildResponseSchema`,
  `JsonEncoded`, `ZodResourceSchemas`, `SchemaProjections.compute`.
  `RocketsUserMetadataConfig` is `{ entity, updateSchema, responseSchema,
  repository? }`; `defineZodUserMetadata` returns it. `f.createdAt` /
  `updatedAt` / `deletedAt` are `z.date()`; a response-exposed
  `z.iso.datetime()` throws at definition time; `f.compute` returns
  `z.output<schema>`. `zodResource(...).zod.schemas` replaces `.zod.dtos`.
  Planner `validateSchemaIdUniqueness` rejects two schema instances under one
  component id. The exceptions filter vendors `mapHttpStatus` (removed
  upstream) and no longer reads `context.validationErrors` (gone upstream).
  Upstream `CrudInitApiBody` stamps generated CRUD request bodies as an
  inline `ApiBody({ schema })` that Swagger merges over the route's own
  `@Body({ schema })` (conceptadev/nestjs-modules#467); `createDocument`
  drops that stamp wherever the route's body schema is named
  (`restoreNamedRequestBodies`), so create / update / replace bodies are
  `$ref`'d to `${Name}CreateDto` / `UpdateDto` / `ReplaceDto` like every
  response. A body that stays inline (`validation: false`, unnamed schema)
  still gets its `definitions` lifted (`liftInlineRequestBodyDefinitions`).
- `@nestjs/config` dropped (RFC #104, stage 1). `RocketsCoreModule` and
  `SwaggerUiModule` register their default settings as plain providers
  (`ROCKETS_CORE_SETTINGS_DEFAULTS_TOKEN`, `SWAGGER_UI_DEFAULT_SETTINGS_TOKEN`)
  instead of `registerAs` + `ConfigModule.forFeature`; `ConfigModule` is no
  longer re-exported by either module. Consumers keep passing `settings` as
  before.
- The existing generated-CRUD Standard Schema request bridge now uses the
  official `@standard-schema/spec` contract instead of a local partial copy.
- Core always provides the auth-adapter collection token, including for an
  empty chain, so metadata-free and guard-disabled compositions still boot.
- `AuthServerGuard` recognizes the upstream class-level public-route sentinel.
- The built-in user-metadata CQRS handlers are registered per handler: each one
  is used only when `userMetadata` is configured or that specific handler is
  overridden through `handlers`. Previously, overriding one handler also pulled
  in the other built-in, which fails to resolve the user-metadata repository
  when no metadata contract exists.
- Node.js 20.19 is the minimum supported runtime: the build is CommonJS and
  loads the ESM Nest 12 / `@concepta/nestjs-*` 8 line through `require(esm)`
  (Node 20.18 fails with `ERR_REQUIRE_ESM`; `engines` says `>=20.19.0`).

### Fixed

- **`f.date()` no longer coerces `null` / booleans to the epoch.** Bare
  `z.coerce.date()` turned `null`, `false`, `true` and `0` into 1970 and
  persisted it. `f.date()` now rejects anything that is not an ISO string,
  a numeric timestamp (the documented trade-off) or a `Date` with a `400`
  addressed at the field. OpenAPI still documents `string/date-time` and
  keeps the field in `required`; `unwrapField` sees through the guard
  pipe so column mapping and projections are unchanged.
- **`assertFailClosedResponse` walks every wrapper.** It only knew
  objects, arrays, optional / nullable / default, pipes, lazies and
  unions; an open object inside an intersection, tuple, record / map /
  set value, `.readonly()`, `.catch()` or any other single-child wrapper
  passed the check and shipped the whole row. The walk now reads every
  node that can hold a schema (single-child wrappers through their shared
  `innerType` slot, so a wrapper zod adds later is covered too). The
  hand-supplied paginated envelope (`dto.paginated`,
  `operations.list.paginated`) is checked as well — it was only checked
  for a name.
- **Hidden columns stay hidden through every wrapper, on every response
  path (PR #105 review).** The projection only rebuilt objects, arrays and
  optional / nullable, and only under `f.compute()`; a hidden column below
  a union, intersection, pipe, readonly or lazy stayed declared and reached
  the wire (`f.compute(z.union([nested, fallback]))` shipped
  `nested.secret`), and a JSON column or an exposed relation whose schema
  nested one shipped it too. Union, intersection, pipe (both sides),
  readonly, nonoptional and lazy (memoized per instance — a recursive
  schema no longer overflows the stack) are rebuilt on all three paths;
  `.default()` / `.catch()` hand their payload over WITHOUT running the
  inner schema and are therefore rejected at definition time when a hidden
  column sits below them, like discriminated union, tuple, record, map and
  set. The same strip runs on an `operationResource` output (the fourth
  response path); a TOP-LEVEL `.default()` on a field with a hidden column
  is rejected at definition time rather than silently dropped, and a
  top-level `z.preprocess` is kept (the field is stripped with its wrappers,
  not peeled and partially re-applied); `.prefault()` is rebuilt (its
  payload runs through the inner schema). A HAND-WRITTEN response schema
  (`dto.response`, `operations.*.output`, `dto.paginated`,
  `userMetadata.responseSchema`) is not projected and keeps the author's
  component id, so a hidden field inside it is rejected at definition time
  with a pointer at `.omit()` (`assertNoHiddenFields`, exported for
  consumers that hand a schema to upstream CRUD directly — `rockets-auth`
  runs it on `userCrud.model` / `roleCrud.model`). SSE operations
  serialize through no schema by design (`output: false`).
- **`assertFailClosedResponse` walks the IN side of a transform.** An
  ordinary `.transform()` is a pipe whose object sits on the IN side and
  whose OUT is the transform node, which strips nothing;
  `z.object({...}).passthrough().transform(v => v)` passed the check and
  shipped the undeclared keys. The IN side is walked whenever the OUT
  passes (some of) its input through — `transform`, `any`, `unknown`,
  `custom`, or any composite holding one of those below it (wrappers,
  unions, arrays, object properties, record values, intersections, nested
  pipes); a pipe whose OUT is a real schema (`z.pipe(open, closed)`)
  strips on the way out and still passes.
- **Computed fields strip hidden columns at every depth.** A `dto:
  { response: false }` column two or more levels down a `f.compute()`
  shape (an object inside an optional object inside an array) was kept;
  the strip is recursive now.
- **One OpenAPI component, one side.** The document converter rejects a
  schema instance documented as both a request (`@Body({ schema })`) and
  a response (`ApiResponse({ standardSchema })`): zod's input and output
  JSON Schemas differ by construction, and last-wins documented one side
  with the other's shape silently. Give the response its own
  `withOpenApi()` id. The same check covers NESTED named schemas: they
  reach the document as definitions of whatever embeds them, and one
  nested id emitted with two different shapes (reached from a request
  and from a response) is an error instead of a last-wins merge.
- **Hand-written responses get the fail-closed check too.** The always-on
  route audit reads `@SerializeOptions({ schema })` on every route and
  fails the boot as `requireClosedResponse` when that schema has an open
  object anywhere (`.passthrough()` / `.catchall()`) — the check generated
  resources already get at definition time. `RouteAuditEntry.openResponseSchema`
  carries the path.
- **`requireSchemaPipe` has its own exemption list.** `allow` /
  `allowControllers` exempt a route from the POLICY rules; they no longer
  switch the always-on schema-pipe check off as a side effect. A route
  validated by a pipe the audit cannot recognise is listed in
  `routePolicy.allowUnvalidatedSchema` (route ids). An entry matching more
  than one discovered route fails the boot (`staleAllow`), like `allow`.
- **A generated CRUD body without a schema fails the boot.** Upstream wires
  the validation pipe from the OPERATION-level `request.body` only; a body
  declared at controller level documents the route and validates nothing,
  and no `{ schema }` on the parameter meant `requireSchemaPipe` could not
  see it. The audit now reports it (`RouteAuditEntry.unvalidatedCrudBody`)
  and fails the boot under the same rule — the defect class behind the
  admin update bodies in `rockets-auth`.
- **Report: responses documented but not serialized.**
  `RouteAuditEntry.unserializedResponseSchemas` lists the statuses a route
  documents with `@ApiResponse({ standardSchema })` while serializing
  through no `@SerializeOptions({ schema })` — a documentation-only
  contract, visible in `audit()`; not enforced.
- **`/me` metadata handlers forward the request context (BREAKING for
  handler overrides).** `UpsertUserMetadataCommand` and
  `GetUserMetadataQuery` take `ctx` as their FIRST argument
  (`new UpsertUserMetadataCommand(ctx, userId, data)`,
  `new GetUserMetadataQuery(ctx, userId)`); the built-in handlers forward
  it to every repository call (entity hooks run, the write joins the
  request transaction) and pin `userId` from the caller on the update
  branch. Apps overriding `upsertUserMetadata` / `getUserMetadata` or
  dispatching these directly add the context (`getAppContext(req)`).
- **Migration notes.** A hand-written route carrying BOTH an explicit
  `@ApiBody({ schema })` and a named `@Body({ schema })` is now documented
  from the `@Body` schema (the explicit inline body, including its
  `description` / `examples`, is dropped) — keep one source. `allow` /
  `allowControllers` no longer exempt `requireSchemaPipe`; use
  `allowUnvalidatedSchema`.

### Removed

- **Class-DTO era (RFC #104, stage 4).** `createPaginatedDto`, `FreeFormJson`,
  `ROCKETS_TO_INSTANCE_OPTIONS` / `ROCKETS_TO_PLAIN_OPTIONS`,
  `ZodBodyValidationInterceptor` (+ its `APP_INTERCEPTOR`), `whitelistedFromDto`,
  `UserUpdateDto` / `UserResponseDto` / `RoleNameDto` / `UserRoleItemDto`,
  `PersistenceRow`, `ZodResourceDtos`, the unused `BaseUserDto` /
  `BaseUserCreateDto` / `BaseUserUpdateDto` / `BaseUserMetadata*Dto` classes,
  the `serialization` block passed to `CrudModule.forRoot`, `zod` as an
  optional peer (it is a dependency now).
- **`@concepta/rockets-core/standard-schema` and `/standard-schema/swagger`
  subpaths (RFC #104, stage 2).** `StandardSchemaModule`,
  `createStandardSchemaDto`, `createStandardSchemaResponseDto`,
  `allowStandardSchemaKeys`, `StandardSchemaAwareValidationPipe`,
  `StandardSchemaDtoValidationPipe`, `StandardSchemaResponse`,
  `ApiStandardSchemaResponse`, `withStandardSchemaResponseArrays`,
  `getStandardSchema` and the DTO brands are gone — no consumer, and Nest
  12 provides the same natively (`@Body({ schema })` +
  `StandardSchemaValidationPipe`, `@SerializeOptions({ schema })`,
  `ApiResponse({ standardSchema })`). Generated DTOs (`compileDtoClass`)
  no longer stamp `@Allow()` on their keys (#83 shim): a foreign
  `ValidationPipe({ whitelist: true })` must not sit in front of a
  schema-validated route. `isStandardSchema` / `getCarriedStandardSchema`
  now live in `src/common/utils/standard-schema.util.ts` (internal, not
  exported).
- **`SafeCrudContextInterceptor`** public export. Upstream
  `@concepta/nestjs-crud@8.0.0-alpha.8` already skips non-CRUD handlers in
  `CrudContextOverlay.attach()`; Rockets uses `CrudModule.forRoot` directly.
- `createStubAuthBootstrap()`. It had become an alias for `defineAuthAdapter()`,
  which produces the same host module and additionally accepts imports,
  controllers, providers, exports, and `contributes`. Replace
  `createStubAuthBootstrap(Adapter)` with `defineAuthAdapter(Adapter)`.
