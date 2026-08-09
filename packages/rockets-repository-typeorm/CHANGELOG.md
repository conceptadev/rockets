# Changelog

## Unreleased

### Added

- `defineTypeOrmRepository()`, the adapter-owned `RepositoryBootstrap` that
  combines connection options with the Rockets planner's entity list.

### Changed

- `@nestjs/typeorm` is now a required peer dependency, because
  `defineTypeOrmRepository()` builds the TypeORM root module directly.
- Node.js 20 is the minimum supported runtime.
