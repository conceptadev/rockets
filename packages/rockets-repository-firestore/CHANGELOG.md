# Changelog

## Unreleased

### Added

- Full `WhereOperator` coverage (EQ, NE, comparisons, IN, NIN, null checks,
  string matchers, BETWEEN) with Firestore-native or post-filter execution.
- OR support via `RepositoryAdapter.toDnf()`.
- `skip` / `take` pagination — `orderBy` + `limit(skip + take)` pushed to the
  Firestore Admin SDK so reads scale with the page, not the collection.
- Efficient `count` / `findAndCount` (aggregation when possible).
- Soft delete / restore when `dateRemoved` or `deletedAt` exists on the entity.
- `withDeleted` on find options.
- Exported `ensureFirebaseAdminApp()` for shared Admin bootstrap with auth.

### Changed

- `FirestoreRepositoryModule.forRoot({ entities, backend? })` — global bootstrap
  with Admin validation (mirrors `TypeOrmModule.forRoot({ entities })` shape).
  `defineFirestoreRepository().forRoot()` delegates here.
- Backend API: `query()` replaced by `queryBranch()` / `countBranch()` with
  structured query plans.
- Backend API now requires `create()`, providing atomic single-document create
  semantics that reject duplicate ids. `createMany()` remains sequential and
  non-atomic if a later create fails.
- Document-id `EQ` / `IN` predicates compose with ownership and other filters;
  contradictory id predicates resolve to an empty result.
- Generated ids are persisted and returned from `upsert`, and every order
  clause participates in deterministic sorting.
- Admin SDK and in-memory backends share the same local filter and sort
  semantics for direct document lookups and post-filtered queries.
- Document-id `IN` accepts at most 500 ids and uses one Admin SDK `getAll`
  request; pagination is applied after all requested ids are fetched.
- README documents supported features and Firestore platform limits.
