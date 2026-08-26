# Changelog

## Unreleased

### Release preparation

- Package manifest set to `1.0.0-alpha.8`; registry publication is
  pending.

### Added

- `defineTypeOrmRepository()`, the adapter-owned `RepositoryBootstrap` that
  combines connection options with the Rockets planner's entity list.

### Changed

- Upstream `@concepta/nestjs-repository-typeorm` `8.0.0-alpha.9` (RFC #104,
  stage 4). The zod entity compiler no longer maps `z.iso.datetime()` to a
  datetime column: an ISO-string field is a varchar; `z.date()` / `f.date()` /
  the audit helpers are the datetime columns. `SchemaPersistenceRow<S>` is
  `z.output<S>`.
- `@nestjs/typeorm` is now a required peer dependency, because
  `defineTypeOrmRepository()` builds the TypeORM root module directly.
- Node.js 20 is the minimum supported runtime.
