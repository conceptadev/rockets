import { getApp } from 'firebase-admin/app';
import {
  getFirestore,
  type DocumentData,
  type Firestore,
  type Query,
  type Transaction,
} from 'firebase-admin/firestore';

import { FirestoreDuplicateIdException } from '../exceptions/firestore-duplicate-id.exception';
import type {
  FirestoreBackend,
  FirestoreBranchQueryOptions,
} from '../interfaces/firestore-backend.interface';
import type {
  FirestoreFilterOp,
  FirestoreOrderBy,
  FirestoreQueryBranch,
} from '../interfaces/firestore-query.interface';
import type { FirestoreTransactionHandle } from '../interfaces/firestore-transaction-handle.interface';
import { applyFirestorePostFilters } from '../repository/firestore-post-filter';
import { applyFirestoreFilters } from '../repository/firestore-row-filter';
import { sortFirestoreRows } from '../repository/firestore-sort';
import { normalizeFirestoreValue } from '../repository/firestore-value';

// Batched reads keep argument lists bounded; getAll itself has no hard cap.
const GET_ALL_CHUNK = 300;

const GRPC_ALREADY_EXISTS = 6;

function isAlreadyExistsError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === GRPC_ALREADY_EXISTS
  );
}

function serialise(data: Record<string, unknown>): Record<string, unknown> {
  return { ...data };
}

function normalise(
  data: DocumentData | undefined,
  documentId: string,
): Record<string, unknown> {
  if (!data) {
    return { id: documentId };
  }
  const next: Record<string, unknown> = { id: documentId };
  for (const [key, value] of Object.entries(data)) {
    next[key] = normalizeFirestoreValue(value);
  }
  return next;
}

class AdminFirestoreTransactionHandle implements FirestoreTransactionHandle {
  constructor(
    private readonly transaction: Transaction,
    private readonly db: Firestore,
  ) {}

  async get(
    collection: string,
    documentId: string,
  ): Promise<Record<string, unknown> | null> {
    const snap = await this.transaction.get(
      this.db.collection(collection).doc(documentId),
    );
    if (!snap.exists) {
      return null;
    }
    return normalise(snap.data(), documentId);
  }

  async create(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    // ALREADY_EXISTS for transaction.create() surfaces at commit, not at
    // enqueue — so read first and throw the adapter's 409 shape here. Under
    // contention Firestore retries the whole attempt; the loser then sees
    // the winner's doc and gets FirestoreDuplicateIdException instead of a
    // raw gRPC error.
    const ref = this.db.collection(collection).doc(documentId);
    const snap = await this.transaction.get(ref);
    if (snap.exists) {
      throw new FirestoreDuplicateIdException(collection, documentId);
    }
    this.transaction.create(ref, serialise(data));
  }

  async set(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
    merge = false,
  ): Promise<void> {
    this.transaction.set(
      this.db.collection(collection).doc(documentId),
      serialise(data),
      { merge },
    );
  }

  async delete(collection: string, documentId: string): Promise<void> {
    this.transaction.delete(this.db.collection(collection).doc(documentId));
  }

  async queryBranch(
    collection: string,
    options: FirestoreBranchQueryOptions,
  ): Promise<Record<string, unknown>[]> {
    const branch = options.branch;
    const skip = options.skip ?? 0;
    const take = options.take;

    if (branch.documentId !== undefined || branch.documentIds !== undefined) {
      const rows = await this.loadBranchRows(collection, branch);
      const filtered = applyFirestorePostFilters(
        applyFirestoreFilters(rows, branch.filters),
        branch.postFilters,
      );
      const ordered = sortFirestoreRows(filtered, options.orderBy);
      const sliced = ordered.slice(skip);
      return typeof take === 'number' && take > 0
        ? sliced.slice(0, take)
        : sliced;
    }

    // Mirror the non-transactional fast path: when there are no post-filters,
    // push orderBy + limit(skip + take) so we don't lock the whole set.
    let query = buildCollectionQuery(this.db, collection, branch);
    if (options.orderBy) {
      for (const clause of options.orderBy) {
        query = query.orderBy(clause.field, clause.direction);
      }
    }

    if (branch.postFilters.length > 0) {
      const snapshot = await this.transaction.get(query);
      const rows = snapshot.docs.map((doc) => normalise(doc.data(), doc.id));
      const filtered = applyFirestorePostFilters(rows, branch.postFilters);
      const sliced = filtered.slice(skip);
      return typeof take === 'number' && take > 0
        ? sliced.slice(0, take)
        : sliced;
    }

    if (typeof take === 'number' && take > 0) {
      query = query.limit(skip + take);
    }
    const snapshot = await this.transaction.get(query);
    const rows = snapshot.docs.map((doc) => normalise(doc.data(), doc.id));
    return skip > 0 ? rows.slice(skip) : rows;
  }

  async countBranch(
    collection: string,
    branch: FirestoreQueryBranch,
  ): Promise<number> {
    const rows = await this.queryBranch(collection, { branch });
    return rows.length;
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

    const query = buildCollectionQuery(this.db, collection, branch);
    const snapshot = await this.transaction.get(query);
    return snapshot.docs.map((doc) => normalise(doc.data(), doc.id));
  }
}

function buildCollectionQuery(
  db: Firestore,
  collection: string,
  branch: FirestoreQueryBranch,
): Query {
  let query: Query = db.collection(collection);

  for (const filter of branch.filters) {
    query = query.where(
      filter.field,
      filter.op as FirestoreFilterOp,
      filter.value,
    );
  }

  return query;
}

export class AdminFirestoreBackend implements FirestoreBackend {
  private db() {
    return getFirestore(getApp());
  }

  async get(
    collection: string,
    documentId: string,
  ): Promise<Record<string, unknown> | null> {
    const snap = await this.db().collection(collection).doc(documentId).get();
    if (!snap.exists) {
      return null;
    }
    return normalise(snap.data(), documentId);
  }

  async set(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
    merge = false,
  ): Promise<void> {
    await this.db()
      .collection(collection)
      .doc(documentId)
      .set(serialise(data), { merge });
  }

  async create(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.db()
        .collection(collection)
        .doc(documentId)
        .create(serialise(data));
    } catch (error) {
      if (isAlreadyExistsError(error)) {
        throw new FirestoreDuplicateIdException(collection, documentId);
      }
      throw error;
    }
  }

  async delete(collection: string, documentId: string): Promise<void> {
    await this.db().collection(collection).doc(documentId).delete();
  }

  async queryBranch(
    collection: string,
    options: FirestoreBranchQueryOptions,
  ): Promise<Record<string, unknown>[]> {
    const branch = options.branch;
    const skip = options.skip ?? 0;
    const take = options.take;

    if (branch.documentId !== undefined || branch.documentIds !== undefined) {
      const rows = await this.loadBranchRows(collection, branch);
      const filtered = applyFirestorePostFilters(
        applyFirestoreFilters(rows, branch.filters),
        branch.postFilters,
      );
      const ordered = sortFirestoreRows(filtered, options.orderBy);
      const sliced = ordered.slice(skip);
      return typeof take === 'number' && take > 0
        ? sliced.slice(0, take)
        : sliced;
    }

    // Post-filters require in-memory evaluation, so we cannot rely on
    // server-side limit alone — read all matching docs and slice locally.
    if (branch.postFilters.length > 0) {
      const query = this.buildOrderedQuery(collection, branch, options.orderBy);
      const snapshot = await query.get();
      const rows = snapshot.docs.map((doc) => normalise(doc.data(), doc.id));
      const filtered = applyFirestorePostFilters(rows, branch.postFilters);
      const sliced = filtered.slice(skip);
      return typeof take === 'number' && take > 0
        ? sliced.slice(0, take)
        : sliced;
    }

    // Fast path: push orderBy + limit(skip + take) to Firestore, slice(skip)
    // locally. Reads are O(skip + take), not O(collection size).
    let query = this.buildOrderedQuery(collection, branch, options.orderBy);
    if (typeof take === 'number' && take > 0) {
      query = query.limit(skip + take);
    }
    const snapshot = await query.get();
    const rows = snapshot.docs.map((doc) => normalise(doc.data(), doc.id));
    return skip > 0 ? rows.slice(skip) : rows;
  }

  async countBranch(
    collection: string,
    branch: FirestoreQueryBranch,
  ): Promise<number> {
    if (
      branch.postFilters.length > 0 ||
      branch.documentId !== undefined ||
      branch.documentIds !== undefined
    ) {
      const rows = await this.loadBranchRows(collection, branch);
      return applyFirestorePostFilters(
        applyFirestoreFilters(rows, branch.filters),
        branch.postFilters,
      ).length;
    }

    const query = buildCollectionQuery(this.db(), collection, branch);
    const snapshot = await query.count().get();
    return snapshot.data().count;
  }

  async runTransaction<T>(
    fn: (tx: FirestoreTransactionHandle) => Promise<T>,
  ): Promise<T> {
    const db = this.db();
    return db.runTransaction(async (transaction) =>
      fn(new AdminFirestoreTransactionHandle(transaction, db)),
    );
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
      if (branch.documentIds.length === 0) return [];
      const collectionRef = this.db().collection(collection);
      const rows: Record<string, unknown>[] = [];
      for (
        let index = 0;
        index < branch.documentIds.length;
        index += GET_ALL_CHUNK
      ) {
        const refs = branch.documentIds
          .slice(index, index + GET_ALL_CHUNK)
          .map((documentId) => collectionRef.doc(documentId));
        const snapshots = await this.db().getAll(...refs);
        for (const snapshot of snapshots) {
          if (snapshot.exists) {
            rows.push(normalise(snapshot.data(), snapshot.id));
          }
        }
      }
      return rows;
    }

    const query = buildCollectionQuery(this.db(), collection, branch);
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => normalise(doc.data(), doc.id));
  }

  private buildOrderedQuery(
    collection: string,
    branch: FirestoreQueryBranch,
    orderBy: readonly FirestoreOrderBy[] | undefined,
  ): Query {
    let query = buildCollectionQuery(this.db(), collection, branch);
    if (orderBy) {
      for (const clause of orderBy) {
        query = query.orderBy(clause.field, clause.direction);
      }
    }
    return query;
  }
}
