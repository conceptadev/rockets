import type {
  FirestoreBackend,
  FirestoreBranchQueryOptions,
} from '../interfaces/firestore-backend.interface';
import type { FirestoreQueryBranch } from '../interfaces/firestore-query.interface';
import { applyFirestorePostFilters } from '../repository/firestore-post-filter';
import { applyFirestoreFilters } from '../repository/firestore-row-filter';
import { sortFirestoreRows } from '../repository/firestore-sort';

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
  private readonly stores = new Map<
    string,
    Map<string, Record<string, unknown>>
  >();

  private collectionStore(
    collection: string,
  ): Map<string, Record<string, unknown>> {
    let store = this.stores.get(collection);
    if (!store) {
      store = new Map();
      this.stores.set(collection, store);
    }
    return store;
  }

  async get(
    collection: string,
    documentId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.collectionStore(collection).get(documentId) ?? null;
  }

  async set(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
    merge = false,
  ): Promise<void> {
    const store = this.collectionStore(collection);
    const current = store.get(documentId);
    store.set(
      documentId,
      merge && current ? { ...current, ...data } : { ...data, id: documentId },
    );
  }

  async create(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const store = this.collectionStore(collection);
    if (store.has(documentId)) {
      throw new Error(
        `Firestore document "${collection}/${documentId}" already exists.`,
      );
    }
    store.set(documentId, { ...data, id: documentId });
  }

  async delete(collection: string, documentId: string): Promise<void> {
    this.collectionStore(collection).delete(documentId);
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

    return [...this.collectionStore(collection).values()];
  }
}
