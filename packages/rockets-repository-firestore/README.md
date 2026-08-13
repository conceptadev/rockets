# @concepta/rockets-repository-firestore

[![NPM](https://img.shields.io/npm/v/@concepta/rockets-repository-firestore)](https://www.npmjs.com/package/@concepta/rockets-repository-firestore)
[![NestJS](https://img.shields.io/badge/NestJS-12-ea2845?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> Firestore adapter for the Rockets dynamic-repository contract. Mix
> Firestore-backed entities with a TypeORM (or any other) default adapter, per
> entity.

**Status:** pre-1.0 preview. The package manifest is set to `1.0.0-alpha.8`, but
registry publication is pending; install commands below apply after the
`alpha` dist-tag is updated. Public shapes may still change before 1.0.

---

## 1. Introduction

`@concepta/rockets-repository-firestore` implements `RepositoryAdapter` and
`DynamicRepositoryModule` from `@concepta/nestjs-repository`, so any Rockets
handler that talks to `RepositoryInterface<T>` will work against Firestore
without code changes.

The package is **per-entity opt-in**, not a wholesale replacement: register it
as the override on a single entity inside
`defineModuleResource({ entities: [{ entity, repository, collection? }] })`.
Other entities continue on the default adapter (TypeORM, in most apps).

### What it gives you

- `FirestoreRepositoryModule.forRoot({ entities, backend? })` — validates
  Firebase Admin (or test backend) and returns a global module; same shape as
  `TypeOrmModule.forRoot({ ...connection, entities })`.
- `FirestoreRepositoryModule.forFeature(entities, options?)` — registers dynamic
  repository providers per entity row.
- `defineFirestoreRepository()` — `RepositoryBootstrap` with the same shape as
  `defineTypeOrmRepository` from `@concepta/rockets-repository-typeorm`.
- `FirestoreRepository<Entity>` — adapter class implementing
  `RepositoryAdapter<Entity>`.
- `ensureFirebaseAdminApp(packageRoot)` — singleton Admin initialisation for
  apps that wire Firebase outside `defineFirebaseAuth`.
- `InMemoryFirestoreBackend` — explicit test double; inject via
  `forFeature(..., { backend })` or `defineFirestoreRepository({ backend })` in
  test harnesses only.

### When to use this package

- You want a single entity (analytics events, large blobs, audit log) on
  Firestore while the rest of the app stays on SQL.
- You want a Firebase-first app with Firebase Auth + Firestore storage.

### When NOT to use this package

- You need SQL-style relational joins or multi-field unique constraints that
  cannot map to a document id / uniqueness-index collection — see issue #44
  "Honest limits".
- You only want SQL — install `@concepta/rockets-repository-typeorm` instead.

### Transactions

Prefer `runInFirestoreTransaction(backend, async () => { … })` for contended
read-modify-write (rate limits, leases, turn locks, idempotent enqueue). The
body runs **inside** the SDK callback, so a contention retry re-executes it.
Repository calls made during the callback automatically join the ambient
transaction — no `{ ctx }` plumbing required.

`TransactionScope.run(ctx, …)` with `{ ctx }` still works for uncontended
multi-write units, but the imperative bridge **refuses** a Firestore retry
(throws `FIRESTORE_TRANSACTION_RETRY_UNSUPPORTED`) instead of committing an
empty write set. Do not use it for hot paths that expect retries.

Firestore limits a single transaction to **500 writes**; the adapter does not
split oversized units.

Atomic `createMany` / `deleteMany` (WriteBatch) and soft-delete server-side
pushdown are still follow-ups (issue #44 P1-4 / P1-6).

---

## 2. Get Started

### Install

```bash
yarn add @concepta/rockets-repository-firestore@alpha @concepta/rockets-core@alpha \
  firebase-admin
```

### Initialise Firebase Admin in the app (required)

Production apps must initialise Firebase Admin **once**, centrally — the same
way TypeORM connection options live in `defineTypeOrmRepository`:

- via `defineFirebaseAuth({ forRootAsync: ... })` (recommended when using
  Firebase Auth), or
- via `ensureFirebaseAdminApp(packageRoot)` before Rockets boots.

The repository package does **not** read credentials, flip env flags, or fall
back to an in-memory store.

Credential paths (`FIREBASE_SERVICE_ACCOUNT_PATH`,
`GOOGLE_APPLICATION_CREDENTIALS`, `FIREBASE_PROJECT_ID`) are resolved by
`ensureFirebaseAdminApp` when the **app** calls it — not inside
`defineFirestoreRepository`.

### Use one entity on Firestore

```typescript
import { defineModuleResource } from '@concepta/rockets-core';
import { defineFirestoreRepository } from '@concepta/rockets-repository-firestore';

import { AnalyticsEventEntity } from './analytics-event.entity';

const firestoreRepository = defineFirestoreRepository();

export const analyticsFeature = defineModuleResource({
  entities: [
    {
      entity: AnalyticsEventEntity,
      repository: firestoreRepository,
      collection: 'analytics_events',
    },
  ],
  providers: [
    /* services that inject the dynamic repository */
  ],
});
```

The rest of `RocketsCoreModule.forRoot({ repository: <default> })` keeps using
its default SQL adapter. Core calls `forRoot` / `forFeature` on each bootstrap
adapter in the registration plan.

### Bootstrap: `forRoot` vs `forFeature`

Same **API shape** as `defineTypeOrmRepository`, different behaviour:

| Call                                  | Firestore behaviour                                                                                                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`forRoot({ entities, backend? })`** | Validates Firebase Admin is ready (or uses test `backend`). Returns a global module shell. The `entities` list mirrors the Rockets planner contract — Firestore does not register metadata on entities here (unlike TypeORM connection metadata). |
| **`forFeature(entities, options?)`**  | Creates `@InjectDynamicRepository` providers for each entity row. This is where repositories actually materialise.                                                                                                                                |

Rockets core always invokes **both** once per `RepositoryBootstrap` in the plan.
Do not skip `forFeature` or register repos only in `forRoot`.

---

## 3. How-to Guides

### Override the collection id

The default collection id equals the entity key (derived from the entity class
name). Set `collection` on the entity registration row:

```typescript
defineModuleResource({
  entities: [
    {
      entity: CodeReviewReportEntity,
      repository: firestoreRepository,
      collection: 'code_review_reports',
    },
  ],
});
```

### Tests

Do not use environment flags. Inject the in-memory backend explicitly:

```typescript
import {
  defineFirestoreRepository,
  InMemoryFirestoreBackend,
} from '@concepta/rockets-repository-firestore';

const testRepository = defineFirestoreRepository({
  backend: new InMemoryFirestoreBackend(),
});
```

Or call the module factory directly in unit tests:

```ts
FirestoreRepositoryModule.forFeature(entities, {
  backend: new InMemoryFirestoreBackend(),
});
```

### Soft delete

The soft-delete column is **auto-detected only** — the adapter checks the
entity instance for a `dateRemoved` or `deletedAt` property
(`FIRESTORE_DEFAULT_SOFT_DELETE_FIELD` / `FIRESTORE_ALT_SOFT_DELETE_FIELD`).
`ModuleResourceEntityEntry` (the shape accepted by
`defineModuleResource({ entities: [...] })`) has no `softDeleteField`
override — name the column `dateRemoved` or `deletedAt` on the entity class.
If neither name is present, `delete()` calls throw at runtime with a message
naming both supported column names.

### Local query parity

The in-memory backend and Admin SDK direct-document/post-filter paths match
Firestore for missing versus explicit `null`, nested field paths, structural
equality, and scalar range filters that compare only values sharing the query
bound's type. `between` is a client-side Rockets operator and intentionally
requires its value and bounds to share one scalar type. Local `orderBy` uses
Firestore's deterministic type order and supports every Firestore value type,
including `NaN`, bytes, references, geographical points, arrays, vectors, and
maps.

Document-id `IN` queries accept at most 500 ids and use one Admin SDK `getAll`
request. The direct-document path fetches all requested ids before applying
`skip` and `take`, so a page limit does not reduce document reads.

`createMany()` writes documents sequentially and is not atomic: if a later
document id already exists, earlier documents from the same call remain
created. Atomic batched creation is intentionally deferred to a future backend
contract change.

---

## 4. Reference

### Module

| Member                                                      | Purpose                                                                                                                                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FirestoreRepositoryModule.forRoot({ entities, backend? })` | Global bootstrap — validates Firebase Admin in production (or accepts `{ backend }` in tests). Receives the planner-derived entity list, like `TypeOrmModule.forRoot({ entities })`. |
| `FirestoreRepositoryModule.forFeature(entities, options?)`  | Returns a `DynamicRepositoryModule` with `@InjectDynamicRepository` providers. Production omits `options`; tests may pass `{ backend: InMemoryFirestoreBackend }`.                   |
| `defineFirestoreRepository(options?)`                       | Returns a `RepositoryBootstrap` — delegates to `FirestoreRepositoryModule.forRoot` / `forFeature`, same contract as `defineTypeOrmRepository`.                                       |

### Helpers

| Symbol                                | Purpose                                               |
| ------------------------------------- | ----------------------------------------------------- |
| `ensureFirebaseAdminApp(packageRoot)` | App-level Admin singleton (call from auth bootstrap). |
| `InMemoryFirestoreBackend`            | Explicit test double — not selected by env vars.      |

---

## License

BSD-3-Clause
