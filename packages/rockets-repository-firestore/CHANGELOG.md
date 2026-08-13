# Changelog

## Unreleased

### Breaking — data migration required

- **Soft-delete exclusion moved server-side (issue #44 P1-4).** Default
  `find` / `count` now send `softDeleteField == null` to Firestore instead of
  filtering in memory, which restores `limit()` and the `count()`
  aggregation for every soft-deletable entity. Two consequences:
  - **Existing documents that do not carry the field become invisible** to
    default lists (Firestore equality never matches a missing field). Run
    `backfillSoftDeleteNull` (or the Admin `stream()` + `BulkWriter` recipe in
    the README) **before** deploying this version.
  - Lists that combine soft delete with another predicate or `orderBy` now
    need a **composite index**; without it Firestore returns
    `FAILED_PRECONDITION`. See `firestore.indexes.example.json`. The emulator
    does not validate indexes, so a green suite does not prove this.

  The adapter writes the marker on `create`, on `upsert` that lands on a new
  document, and on `replace` (carrying the previous state). `update` and
  `upsert` over an existing document never invent it, so soft-deleted rows are
  not resurrected.

### Added

- **Transactions (issue #44 P1-1).** `FirestoreBackend.runTransaction` for
  callback-shaped atomic units; `runInFirestoreTransaction` /
  `FirestoreRepository.transaction` keep the body inside the SDK callback
  (retries re-execute); `FIRESTORE_BACKEND` is exported from `forFeature`;
  `transactionFactories` registered so `TransactionScope` /
  `transactional: true` is supported (imperative bridge refuses retries and
  logs a one-time warning); every `do*` method threads ambient /
  `options.ctx` into the transaction. Transactional `create` maps duplicate
  ids to `FirestoreDuplicateIdException`; transactional queries push
  `limit()`.
- Nested `runInFirestoreTransaction` joins the ambient handle on the same
  backend and throws `FIRESTORE_TRANSACTION_BACKEND_MISMATCH` across
  backends; the ambient handle is bound to its backend, so a repository on
  another backend never joins it.
- Full `WhereOperator` coverage (EQ, NE, comparisons, IN, NIN, null checks,
  string matchers, BETWEEN) with Firestore-native or post-filter execution.
- OR support via `RepositoryAdapter.toDnf()`.
- `skip` / `take` pagination — `orderBy` + `limit(skip + take)` pushed to the
  Firestore Admin SDK so reads scale with the page, not the collection.
- Efficient `count` / `findAndCount` (aggregation when possible).
- Soft delete / restore when `dateRemoved` or `deletedAt` exists on the entity.
- `withDeleted` on find options.
- Exported `ensureFirebaseAdminApp()` for shared Admin bootstrap with auth.

### Release preparation

- Package manifest set to `1.0.0-alpha.8`; registry publication is
  pending.

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
- Unicode map-key ordering in local and post-filter sorts now matches
  Firestore ordering.
- Document-id `IN` accepts at most 500 ids and uses one Admin SDK `getAll`
  request; pagination is applied after all requested ids are fetched.
- README documents supported features and Firestore platform limits.
