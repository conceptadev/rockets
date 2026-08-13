import { FIRESTORE_MAX_BATCH_WRITES } from '../constants/firestore-transaction.constants';
import { FirestoreBatchWriteLimitExceededException } from '../exceptions/firestore-batch-write-limit-exceeded.exception';
import { FirestoreDuplicateIdException } from '../exceptions/firestore-duplicate-id.exception';
import { FirestoreInvalidPreconditionException } from '../exceptions/firestore-invalid-precondition.exception';
import { FirestorePreconditionFailedException } from '../exceptions/firestore-precondition-failed.exception';
import { FirestoreTransactionReadAfterWriteException } from '../exceptions/firestore-transaction-read-after-write.exception';
import type {
  FirestoreBackend,
  FirestoreBatchOperation,
  FirestoreBranchQueryOptions,
} from '../interfaces/firestore-backend.interface';
import type { FirestoreQueryBranch } from '../interfaces/firestore-query.interface';
import type { FirestoreTransactionHandle } from '../interfaces/firestore-transaction-handle.interface';
import type { FirestoreWritePrecondition } from '../interfaces/firestore-write.interface';
import { isFirestoreIncrementSentinel } from '../interfaces/firestore-write.interface';
import { applyFirestorePostFilters } from '../repository/firestore-post-filter';
import { applyFirestoreFilters } from '../repository/firestore-row-filter';
import { sortFirestoreRows } from '../repository/firestore-sort';
import { FirestoreTransactionWriteCounter } from '../transaction/firestore-transaction-write-counter';

type TimedCollectionStore = Map<string, StoredDocument>;
type TimedStoreMap = Map<string, TimedCollectionStore>;

interface StoredDocument {
  readonly data: Record<string, unknown>;
  readonly updateTime: Date;
}

function cloneStores(source: TimedStoreMap): TimedStoreMap {
  const next: TimedStoreMap = new Map();
  for (const [collection, docs] of source) {
    const cloned: TimedCollectionStore = new Map();
    for (const [id, row] of docs) {
      cloned.set(id, {
        data: { ...row.data },
        updateTime: new Date(row.updateTime.getTime()),
      });
    }
    next.set(collection, cloned);
  }
  return next;
}

function collectionStore(
  stores: TimedStoreMap,
  collection: string,
): TimedCollectionStore {
  let store = stores.get(collection);
  if (!store) {
    store = new Map();
    stores.set(collection, store);
  }
  return store;
}

function applyWriteData(
  current: Record<string, unknown> | undefined,
  data: Record<string, unknown>,
  merge: boolean,
): Record<string, unknown> {
  const base = merge && current ? { ...current } : {};
  for (const [key, value] of Object.entries(data)) {
    if (isFirestoreIncrementSentinel(value)) {
      const existing = base[key];
      const currentNumber = typeof existing === 'number' ? existing : 0;
      base[key] = currentNumber + value.__firestoreIncrement;
    } else {
      base[key] = value;
    }
  }
  return base;
}

function assertPrecondition(
  collection: string,
  documentId: string,
  existing: StoredDocument | undefined,
  precondition: FirestoreWritePrecondition | undefined,
  mode: 'set' | 'delete',
): void {
  if (precondition === undefined) {
    return;
  }
  if (
    precondition.lastUpdateTime !== undefined &&
    precondition.exists !== undefined
  ) {
    throw new FirestoreInvalidPreconditionException(
      'Firestore precondition cannot set both lastUpdateTime and exists',
    );
  }
  if (precondition.exists === false) {
    if (mode === 'set') {
      throw new FirestoreInvalidPreconditionException(
        'Firestore set/update precondition cannot require exists: false — use create()',
      );
    }
    if (existing !== undefined) {
      throw new FirestorePreconditionFailedException(collection, documentId);
    }
    return;
  }
  // Preconditioned set uses update semantics — document must exist.
  if (mode === 'set' && existing === undefined) {
    throw new FirestorePreconditionFailedException(collection, documentId);
  }
  if (precondition.exists === true && existing === undefined) {
    throw new FirestorePreconditionFailedException(collection, documentId);
  }
  if (
    precondition.lastUpdateTime !== undefined &&
    (existing === undefined ||
      existing.updateTime.getTime() !== precondition.lastUpdateTime.getTime())
  ) {
    throw new FirestorePreconditionFailedException(collection, documentId);
  }
}

class InMemoryFirestoreTransactionHandle implements FirestoreTransactionHandle {
  private wrote = false;
  private readonly writes = new FirestoreTransactionWriteCounter();

  constructor(private readonly stores: TimedStoreMap) {}

  async get(
    collection: string,
    documentId: string,
  ): Promise<Record<string, unknown> | null> {
    this.assertReadable();
    return (
      collectionStore(this.stores, collection).get(documentId)?.data ?? null
    );
  }

  async create(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
    options?: { readonly skipExistenceRead?: boolean },
  ): Promise<void> {
    const store = collectionStore(this.stores, collection);
    if (!options?.skipExistenceRead) {
      this.assertReadable();
    }
    if (store.has(documentId)) {
      throw new FirestoreDuplicateIdException(collection, documentId);
    }
    this.writes.recordWrite();
    store.set(documentId, {
      data: applyWriteData(undefined, { ...data, id: documentId }, false),
      updateTime: new Date(),
    });
    this.wrote = true;
  }

  async set(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
    merge = false,
    precondition?: FirestoreWritePrecondition,
  ): Promise<void> {
    const store = collectionStore(this.stores, collection);
    const current = store.get(documentId);
    if (precondition !== undefined && !merge) {
      throw new FirestoreInvalidPreconditionException(
        'Firestore preconditioned set requires merge: true (update semantics)',
      );
    }
    assertPrecondition(collection, documentId, current, precondition, 'set');
    this.writes.recordWrite();
    store.set(documentId, {
      data: {
        ...applyWriteData(current?.data, data, merge),
        id: documentId,
      },
      updateTime: new Date(),
    });
    this.wrote = true;
  }

  async delete(
    collection: string,
    documentId: string,
    precondition?: FirestoreWritePrecondition,
  ): Promise<void> {
    const store = collectionStore(this.stores, collection);
    assertPrecondition(
      collection,
      documentId,
      store.get(documentId),
      precondition,
      'delete',
    );
    this.writes.recordWrite();
    store.delete(documentId);
    this.wrote = true;
  }

  async queryBranch(
    collection: string,
    options: FirestoreBranchQueryOptions,
  ): Promise<Record<string, unknown>[]> {
    this.assertReadable();
    const rows = await this.loadBranchRows(collection, options.branch);
    const filtered = applyFirestorePostFilters(
      applyFirestoreFilters(rows, options.branch.filters),
      options.branch.postFilters,
    );
    const ordered = sortFirestoreRows(filtered, options.orderBy);

    const sliced = ordered.slice(options.skip ?? 0);
    if (typeof options.take === 'number' && options.take > 0) {
      return sliced.slice(0, options.take);
    }
    return sliced;
  }

  async countBranch(
    collection: string,
    branch: FirestoreQueryBranch,
  ): Promise<number> {
    this.assertReadable();
    const rows = await this.queryBranch(collection, { branch });
    return rows.length;
  }

  private assertReadable(): void {
    if (this.wrote) {
      throw new FirestoreTransactionReadAfterWriteException();
    }
  }

  private async loadBranchRows(
    collection: string,
    branch: FirestoreQueryBranch,
  ): Promise<Record<string, unknown>[]> {
    if (branch.documentId !== undefined) {
      const row = await this.get(collection, branch.documentId);
      return row ? [row] : [];
    }

    if (branch.documentIds !== undefined) {
      const rows: Record<string, unknown>[] = [];
      for (const documentId of branch.documentIds) {
        const row = await this.get(collection, documentId);
        if (row) {
          rows.push(row);
        }
      }
      return rows;
    }

    return [...collectionStore(this.stores, collection).values()].map(
      (entry) => entry.data,
    );
  }
}

/**
 * In-memory Firestore backend for unit tests and explicit test harnesses.
 *
 * State is PER INSTANCE. It used to live in a module-level `Map`, which
 * meant every `new InMemoryFirestoreBackend()` in a process shared one
 * store: two independent apps saw each other's documents, and tests
 * leaked rows into one another unless they happened to use distinct
 * collection names.
 */
export class InMemoryFirestoreBackend implements FirestoreBackend {
  private stores: TimedStoreMap = new Map();
  private generation = 0;

  private rootCollectionStore(collection: string): TimedCollectionStore {
    return collectionStore(this.stores, collection);
  }

  async get(
    collection: string,
    documentId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.rootCollectionStore(collection).get(documentId)?.data ?? null;
  }

  async set(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
    merge = false,
    precondition?: FirestoreWritePrecondition,
  ): Promise<void> {
    const store = this.rootCollectionStore(collection);
    const current = store.get(documentId);
    if (precondition !== undefined && !merge) {
      throw new FirestoreInvalidPreconditionException(
        'Firestore preconditioned set requires merge: true (update semantics)',
      );
    }
    assertPrecondition(collection, documentId, current, precondition, 'set');
    store.set(documentId, {
      data: {
        ...applyWriteData(current?.data, data, merge),
        id: documentId,
      },
      updateTime: new Date(),
    });
    this.generation += 1;
  }

  async create(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
    _options?: { readonly skipExistenceRead?: boolean },
  ): Promise<void> {
    const store = this.rootCollectionStore(collection);
    if (store.has(documentId)) {
      throw new FirestoreDuplicateIdException(collection, documentId);
    }
    store.set(documentId, {
      data: applyWriteData(undefined, { ...data, id: documentId }, false),
      updateTime: new Date(),
    });
    this.generation += 1;
  }

  async delete(
    collection: string,
    documentId: string,
    precondition?: FirestoreWritePrecondition,
  ): Promise<void> {
    const store = this.rootCollectionStore(collection);
    assertPrecondition(
      collection,
      documentId,
      store.get(documentId),
      precondition,
      'delete',
    );
    store.delete(documentId);
    this.generation += 1;
  }

  async queryBranch(
    collection: string,
    options: FirestoreBranchQueryOptions,
  ): Promise<Record<string, unknown>[]> {
    const rows = await this.loadBranchRows(collection, options.branch);
    const filtered = applyFirestorePostFilters(
      applyFirestoreFilters(rows, options.branch.filters),
      options.branch.postFilters,
    );
    const ordered = sortFirestoreRows(filtered, options.orderBy);

    const sliced = ordered.slice(options.skip ?? 0);
    if (typeof options.take === 'number' && options.take > 0) {
      return sliced.slice(0, options.take);
    }
    return sliced;
  }

  async countBranch(
    collection: string,
    branch: FirestoreQueryBranch,
  ): Promise<number> {
    const rows = await this.loadBranchRows(collection, branch);
    const filtered = applyFirestorePostFilters(
      applyFirestoreFilters(rows, branch.filters),
      branch.postFilters,
    );
    return filtered.length;
  }

  async runTransaction<T>(
    fn: (tx: FirestoreTransactionHandle) => Promise<T>,
  ): Promise<T> {
    const startedAt = this.generation;
    const working = cloneStores(this.stores);
    const handle = new InMemoryFirestoreTransactionHandle(working);
    const result = await fn(handle);
    if (this.generation !== startedAt) {
      throw new Error(
        'Firestore in-memory transaction conflict: store changed during the attempt',
      );
    }
    this.stores = working;
    this.generation += 1;
    return result;
  }

  async writeBatch(
    operations: readonly FirestoreBatchOperation[],
  ): Promise<void> {
    if (operations.length === 0) {
      return;
    }
    if (operations.length > FIRESTORE_MAX_BATCH_WRITES) {
      throw new FirestoreBatchWriteLimitExceededException(operations.length);
    }

    const working = cloneStores(this.stores);
    for (const operation of operations) {
      const store = collectionStore(working, operation.collection);
      if (operation.op === 'create') {
        if (store.has(operation.id)) {
          throw new FirestoreDuplicateIdException(
            operation.collection,
            operation.id,
          );
        }
        store.set(operation.id, {
          data: applyWriteData(
            undefined,
            { ...operation.data, id: operation.id },
            false,
          ),
          updateTime: new Date(),
        });
      } else {
        store.delete(operation.id);
      }
    }
    this.stores = working;
    this.generation += 1;
  }

  private async loadBranchRows(
    collection: string,
    branch: FirestoreQueryBranch,
  ): Promise<Record<string, unknown>[]> {
    if (branch.documentId !== undefined) {
      const row = await this.get(collection, branch.documentId);
      return row ? [row] : [];
    }

    if (branch.documentIds !== undefined) {
      const rows: Record<string, unknown>[] = [];
      for (const documentId of branch.documentIds) {
        const row = await this.get(collection, documentId);
        if (row) {
          rows.push(row);
        }
      }
      return rows;
    }

    return [...this.rootCollectionStore(collection).values()].map(
      (entry) => entry.data,
    );
  }
}
