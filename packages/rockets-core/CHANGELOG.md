# Changelog

## Unreleased

### Release preparation

- Package manifest set to `1.0.0-alpha.8`; registry publication is
  pending.

### Added

- `@concepta/rockets-core/standard-schema` and
  `@concepta/rockets-core/standard-schema/swagger` subpaths for vendor-neutral
  request DTO validation, response serialization, and OpenAPI metadata in
  hand-written Nest controllers.
- Request and response DTO carrier factories, an opt-in global module, native
  response decorators, stable runtime guards, and Swagger array conversion.
- `compileDtoClass` and `namedZodDto` are exported from the public
  `@concepta/rockets-core/zod` subpath.
- `AuthBootstrapContributions`, allowing an auth integration to carry its owned
  resources, metadata contract, repository, and guard preference.
- `defineAuthAdapter()`, which registers and exports a custom auth adapter from
  a generated host module.

### Changed

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

- **`SafeCrudContextInterceptor`** public export. Upstream
  `@concepta/nestjs-crud@8.0.0-alpha.8` already skips non-CRUD handlers in
  `CrudContextOverlay.attach()`; Rockets uses `CrudModule.forRoot` directly.
- `createStubAuthBootstrap()`. It had become an alias for `defineAuthAdapter()`,
  which produces the same host module and additionally accepts imports,
  controllers, providers, exports, and `contributes`. Replace
  `createStubAuthBootstrap(Adapter)` with `defineAuthAdapter(Adapter)`.
