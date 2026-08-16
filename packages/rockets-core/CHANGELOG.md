# Changelog

## Unreleased

### Release preparation

- Package manifest set to `1.0.0-alpha.8`; registry publication is
  pending.

### Added

- **`operationResource` (issue #43 / #50).** Typed non-CRUD endpoints beside
  `zodResource`: Zod input/output → DTO + OpenAPI, generated Nest controller,
  auth/`public`, optional `transactional`, function or injectable `handle`
  handlers. Authoring surface: callback `operations(op)` with `op.read` /
  `op.write` / `op.delete` (method-constrained); path defaults to the operation
  key; `ctx.params` typed from base + op path. **`output` is required** (schema
  or `false`); optional `params` zod validates path params; cross-resource
  route collisions fail in `buildAppRegistrationPlan`. Wired through
  `resources[]` as `ResourceKind.Operation`. **v1 does not wire ACL grants** —
  authenticated ops are open to any authenticated user unless you pass method
  `decorators` (e.g. access-control grants). Cursor / SSE / binary / raw JSON /
  idempotency / external-client scaffolds remain follow-ups.
- `compileDtoClass` and `namedZodDto` are exported from the public
  `@concepta/rockets-core/zod` subpath.
- `AuthBootstrapContributions`, allowing an auth integration to carry its owned
  resources, metadata contract, repository, and guard preference.
- `defineAuthAdapter()`, which registers and exports a custom auth adapter from
  a generated host module.

### Changed

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
