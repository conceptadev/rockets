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
  Known gap: upstream `CrudInitApiBody` inlines generated CRUD request
  bodies in the document (responses are `$ref`'d) — an upstream follow-up.
  `createDocument` lifts the `definitions` an inline body carries (nested
  named schemas) into `components.schemas` (`liftInlineRequestBodyDefinitions`).
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
- Node.js 20 is the minimum supported runtime.

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
