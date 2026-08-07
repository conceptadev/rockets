# Changelog

## Unreleased

### Added

- `AuthBootstrapContributions`, allowing an auth integration to carry its owned
  resources, metadata contract, repository, and guard preference.
- `defineAuthAdapter()`, which registers and exports a custom auth adapter from
  a generated host module.

### Changed

- `AuthServerGuard` recognizes the upstream class-level public-route sentinel.
- Node.js 20 is the minimum supported runtime.
