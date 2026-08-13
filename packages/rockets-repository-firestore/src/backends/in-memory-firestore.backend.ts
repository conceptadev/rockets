import { FirestoreDuplicateIdException } from '../exceptions/firestore-duplicate-id.exception';
import type {
  FirestoreBackend,
  FirestoreBranchQueryOptions,
} from '../interfaces/firestore-backend.interface';
import type { FirestoreQueryBranch } from '../interfaces/firestore-query.interface';
import type { FirestoreTransactionHandle } from '../interfaces/firestore-transaction-handle.interface';
import { applyFirestorePostFilters } from '../repository/firestore-post-filter';
import { applyFirestoreFilters } from '../repository/firestore-row-filter';
import { sortFirestoreRows } from '../repository/firestore-sort';

type CollectionStore = Map<string, Record<string, unknown>>;
type StoreMap = Map<string, CollectionStore>;

function cloneStores(source: StoreMap): StoreMap {
  const next: StoreMap = new Map();
  for (const [collection, docs] of source) {
    const cloned: CollectionStore = new Map();
    for (const [id, row] of docs) {
      cloned.set(id, { ...row });
    }
    next.set(collection, cloned);
  }
  return next;
}

function collectionStore(
  stores: StoreMap,
  collection: string,
): CollectionStore {
  let store = stores.get(collection);
  if (!store) {
    store = new Map();
    stores.set(collection, store);
  }
  return store;
}

class InMemoryFirestoreTransactionHandle implements FirestoreTransactionHandle {
  private wrote = false;

  constructor(private readonly stores: StoreMap) {}

  async get(
    collection: string,
    documentId: string,
  ): Promise<Record<string, unknown> | null> {
    this.assertReadable();
    return collectionStore(this.stores, collection).get(documentId) ?? null;
  }

  async create(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const store = collectionStore(this.stores, collection);
    if (store.has(documentId)) {
      throw new FirestoreDuplicateIdException(collection, documentId);
    }
    store.set(documentId, { ...data, id: documentId });
    this.wrote = true;
  }

  async set(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
    merge = false,
  ): Promise<void> {
    const store = collectionStore(this.stores, collection);
    const current = store.get(documentId);
    store.set(
      documentId,
      merge && current ? { ...current, ...data } : { ...data, id: documentId },
    );
    this.wrote = true;
  }

  async delete(collection: string, documentId: string): Promise<void> {
    collectionStore(this.stores, collection).delete(documentId);
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
      throw new Error(
        'Firestore transactions require all reads before all writes',
      );
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

    return [...collectionStore(this.stores, collection).values()];
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
  private stores: StoreMap = new Map();
  private generation = 0;

  private rootCollectionStore(collection: string): CollectionStore {
    return collectionStore(this.stores, collection);
  }

  async get(
    collection: string,
    documentId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.rootCollectionStore(collection).get(documentId) ?? null;
  }

  async set(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
    merge = false,
  ): Promise<void> {
    const store = this.rootCollectionStore(collection);
    const current = store.get(documentId);
    store.set(
      documentId,
      merge && current ? { ...current, ...data } : { ...data, id: documentId },
    );
    this.generation += 1;
  }

  async create(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const store = this.rootCollectionStore(collection);
    if (store.has(documentId)) {
      throw new FirestoreDuplicateIdException(collection, documentId);
    }
    store.set(documentId, { ...data, id: documentId });
    this.generation += 1;
  }

  async delete(collection: string, documentId: string): Promise<void> {
    this.rootCollectionStore(collection).delete(documentId);
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

    return [...this.rootCollectionStore(collection).values()];
  }
}
