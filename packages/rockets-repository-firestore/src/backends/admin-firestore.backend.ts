import { getApp } from 'firebase-admin/app';
import {
  FieldValue,
  getFirestore,
  Timestamp,
  type DocumentData,
  type Firestore,
  type Precondition,
  type Query,
  type Transaction,
} from 'firebase-admin/firestore';

import { FIRESTORE_MAX_BATCH_WRITES } from '../constants/firestore-transaction.constants';
import { FirestoreDuplicateIdException } from '../exceptions/firestore-duplicate-id.exception';
import { FirestorePreconditionFailedException } from '../exceptions/firestore-precondition-failed.exception';
import type {
  FirestoreBackend,
  FirestoreBatchOperation,
  FirestoreBranchQueryOptions,
} from '../interfaces/firestore-backend.interface';
import type {
  FirestoreFilterOp,
  FirestoreOrderBy,
  FirestoreQueryBranch,
} from '../interfaces/firestore-query.interface';
import type { FirestoreTransactionHandle } from '../interfaces/firestore-transaction-handle.interface';
import type { FirestoreWritePrecondition } from '../interfaces/firestore-write.interface';
import { isFirestoreIncrementSentinel } from '../interfaces/firestore-write.interface';
import { applyFirestorePostFilters } from '../repository/firestore-post-filter';
import { reconcileOrderByWithInequality } from '../repository/firestore-order-by-reconcile';
import { applyFirestoreFilters } from '../repository/firestore-row-filter';
import { sortFirestoreRows } from '../repository/firestore-sort';
import { normalizeFirestoreValue } from '../repository/firestore-value';
import { FirestoreTransactionWriteCounter } from '../transaction/firestore-transaction-write-counter';

const GET_ALL_CHUNK = 300;

const GRPC_ALREADY_EXISTS = 6;
const GRPC_FAILED_PRECONDITION = 9;

function isAlreadyExistsError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === GRPC_ALREADY_EXISTS
  );
}

function isFailedPreconditionError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === GRPC_FAILED_PRECONDITION
  );
}

function serialise(data: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (isFirestoreIncrementSentinel(value)) {
      next[key] = FieldValue.increment(value.__firestoreIncrement);
    } else {
      next[key] = value;
    }
  }
  return next;
}

function toAdminPrecondition(
  precondition: FirestoreWritePrecondition | undefined,
): Precondition | undefined {
  if (precondition === undefined) {
    return undefined;
  }
  if (precondition.lastUpdateTime !== undefined) {
    return {
      lastUpdateTime: Timestamp.fromDate(precondition.lastUpdateTime),
    };
  }
  if (precondition.exists !== undefined) {
    return { exists: precondition.exists };
  }
  return undefined;
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
  private readonly writes = new FirestoreTransactionWriteCounter();

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
    const ref = this.db.collection(collection).doc(documentId);
    const snap = await this.transaction.get(ref);
    if (snap.exists) {
      throw new FirestoreDuplicateIdException(collection, documentId);
    }
    this.writes.recordWrite();
    this.transaction.create(ref, serialise(data));
  }

  async set(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
    merge = false,
    precondition?: FirestoreWritePrecondition,
  ): Promise<void> {
    this.writes.recordWrite();
    const ref = this.db.collection(collection).doc(documentId);
    const adminPrecondition = toAdminPrecondition(precondition);
    // Precondition is only valid on update/delete in the Admin SDK.
    if (adminPrecondition) {
      this.transaction.update(ref, serialise(data), adminPrecondition);
      return;
    }
    this.transaction.set(ref, serialise(data), { merge });
  }

  async delete(
    collection: string,
    documentId: string,
    precondition?: FirestoreWritePrecondition,
  ): Promise<void> {
    this.writes.recordWrite();
    const ref = this.db.collection(collection).doc(documentId);
    const adminPrecondition = toAdminPrecondition(precondition);
    if (adminPrecondition) {
      this.transaction.delete(ref, adminPrecondition);
    } else {
      this.transaction.delete(ref);
    }
  }

  async queryBranch(
    collection: string,
    options: FirestoreBranchQueryOptions,
  ): Promise<Record<string, unknown>[]> {
    const branch = options.branch;
    const skip = options.skip ?? 0;
    const take = options.take;
    const reconciled = reconcileOrderByWithInequality(branch, options.orderBy);
    const pushLimit =
      branch.postFilters.length === 0 && !reconciled.clientReorder;

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

    let query = buildCollectionQuery(this.db, collection, branch);
    if (reconciled.serverOrderBy) {
      for (const clause of reconciled.serverOrderBy) {
        query = query.orderBy(clause.field, clause.direction);
      }
    }

    if (!pushLimit) {
      const snapshot = await this.transaction.get(query);
      const rows = snapshot.docs.map((doc) => normalise(doc.data(), doc.id));
      const filtered = applyFirestorePostFilters(rows, branch.postFilters);
      const ordered = reconciled.clientReorder
        ? sortFirestoreRows(filtered, options.orderBy)
        : filtered;
      const sliced = ordered.slice(skip);
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
    precondition?: FirestoreWritePrecondition,
  ): Promise<void> {
    try {
      const ref = this.db().collection(collection).doc(documentId);
      const adminPrecondition = toAdminPrecondition(precondition);
      // Precondition is only valid on update/delete in the Admin SDK.
      if (adminPrecondition) {
        await ref.update(serialise(data), adminPrecondition);
        return;
      }
      await ref.set(serialise(data), { merge });
    } catch (error) {
      if (isFailedPreconditionError(error)) {
        throw new FirestorePreconditionFailedException(collection, documentId);
      }
      throw error;
    }
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

  async delete(
    collection: string,
    documentId: string,
    precondition?: FirestoreWritePrecondition,
  ): Promise<void> {
    try {
      const ref = this.db().collection(collection).doc(documentId);
      const adminPrecondition = toAdminPrecondition(precondition);
      if (adminPrecondition) {
        await ref.delete(adminPrecondition);
      } else {
        await ref.delete();
      }
    } catch (error) {
      if (isFailedPreconditionError(error)) {
        throw new FirestorePreconditionFailedException(collection, documentId);
      }
      throw error;
    }
  }

  async queryBranch(
    collection: string,
    options: FirestoreBranchQueryOptions,
  ): Promise<Record<string, unknown>[]> {
    const branch = options.branch;
    const skip = options.skip ?? 0;
    const take = options.take;
    const reconciled = reconcileOrderByWithInequality(branch, options.orderBy);
    const pushLimit =
      branch.postFilters.length === 0 && !reconciled.clientReorder;

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

    if (!pushLimit) {
      const query = this.buildOrderedQuery(
        collection,
        branch,
        reconciled.serverOrderBy,
      );
      const snapshot = await query.get();
      const rows = snapshot.docs.map((doc) => normalise(doc.data(), doc.id));
      const filtered = applyFirestorePostFilters(rows, branch.postFilters);
      const ordered = reconciled.clientReorder
        ? sortFirestoreRows(filtered, options.orderBy)
        : filtered;
      const sliced = ordered.slice(skip);
      return typeof take === 'number' && take > 0
        ? sliced.slice(0, take)
        : sliced;
    }

    let query = this.buildOrderedQuery(
      collection,
      branch,
      reconciled.serverOrderBy,
    );
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

  async writeBatch(
    operations: readonly FirestoreBatchOperation[],
  ): Promise<void> {
    if (operations.length === 0) {
      return;
    }
    if (operations.length > FIRESTORE_MAX_BATCH_WRITES) {
      throw new Error(
        `Firestore writeBatch accepts at most ${FIRESTORE_MAX_BATCH_WRITES} operations (got ${operations.length})`,
      );
    }

    const db = this.db();
    const batch = db.batch();
    for (const operation of operations) {
      const ref = db.collection(operation.collection).doc(operation.id);
      if (operation.op === 'create') {
        batch.create(ref, serialise(operation.data));
      } else {
        batch.delete(ref);
      }
    }

    try {
      await batch.commit();
    } catch (error) {
      if (isAlreadyExistsError(error)) {
        const createOp = operations.find((op) => op.op === 'create');
        throw new FirestoreDuplicateIdException(
          createOp?.collection ?? 'unknown',
          createOp?.id ?? 'unknown',
        );
      }
      throw error;
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
