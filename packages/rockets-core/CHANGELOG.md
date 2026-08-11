# Changelog

## Unreleased

### Release preparation

- Package manifest prepared as `1.0.0-alpha.8`; registry publication is
  pending.

### Added

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

- `createStubAuthBootstrap()`. It had become an alias for `defineAuthAdapter()`,
  which produces the same host module and additionally accepts imports,
  controllers, providers, exports, and `contributes`. Replace
  `createStubAuthBootstrap(Adapter)` with `defineAuthAdapter(Adapter)`.
