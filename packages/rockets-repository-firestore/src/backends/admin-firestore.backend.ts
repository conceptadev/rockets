import { getApp } from 'firebase-admin/app';
import {
  getFirestore,
  type DocumentData,
  type Query,
} from 'firebase-admin/firestore';

import type {
  FirestoreBackend,
  FirestoreBranchQueryOptions,
} from '../interfaces/firestore-backend.interface';
import type {
  FirestoreFilterOp,
  FirestoreOrderBy,
  FirestoreQueryBranch,
} from '../interfaces/firestore-query.interface';
import { applyFirestorePostFilters } from '../repository/firestore-post-filter';
import { applyFirestoreFilters } from '../repository/firestore-row-filter';
import { sortFirestoreRows } from '../repository/firestore-sort';
import { normalizeFirestoreValue } from '../repository/firestore-value';

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
    return this.normalise(snap.data(), documentId);
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
      .set(this.serialise(data), { merge });
  }

  async create(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.db()
      .collection(collection)
      .doc(documentId)
      .create(this.serialise(data));
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
      const rows = snapshot.docs.map((doc) =>
        this.normalise(doc.data(), doc.id),
      );
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
    const rows = snapshot.docs.map((doc) => this.normalise(doc.data(), doc.id));
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

    const query = this.buildCollectionQuery(collection, branch);
    const snapshot = await query.count().get();
    return snapshot.data().count;
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
      const refs = branch.documentIds.map((documentId) =>
        collectionRef.doc(documentId),
      );
      const snapshots = await this.db().getAll(...refs);
      const rows: Record<string, unknown>[] = [];
      for (const snapshot of snapshots) {
        if (snapshot.exists) {
          rows.push(this.normalise(snapshot.data(), snapshot.id));
        }
      }
      return rows;
    }

    const query = this.buildCollectionQuery(collection, branch);
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => this.normalise(doc.data(), doc.id));
  }

  private buildCollectionQuery(
    collection: string,
    branch: FirestoreQueryBranch,
  ): Query {
    let query: Query = this.db().collection(collection);

    for (const filter of branch.filters) {
      query = query.where(
        filter.field,
        filter.op as FirestoreFilterOp,
        filter.value,
      );
    }

    return query;
  }

  private buildOrderedQuery(
    collection: string,
    branch: FirestoreQueryBranch,
    orderBy: readonly FirestoreOrderBy[] | undefined,
  ): Query {
    let query = this.buildCollectionQuery(collection, branch);
    if (orderBy) {
      for (const clause of orderBy) {
        query = query.orderBy(clause.field, clause.direction);
      }
    }
    return query;
  }

  /**
   * `Date` goes to the SDK untouched: Firestore stores it as a native
   * `Timestamp`, which {@link normalise} converts straight back to a
   * `Date`. Stringifying here is what made that round trip lossy and
   * left `normalise`'s `instanceof Timestamp` branch permanently dead.
   */
  private serialise(data: Record<string, unknown>): Record<string, unknown> {
    return { ...data };
  }

  private normalise(
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
}
