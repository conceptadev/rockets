import type { FirestoreBranchQueryOptions } from './firestore-backend.interface';
import type { FirestoreQueryBranch } from './firestore-query.interface';
import type { FirestoreWritePrecondition } from './firestore-write.interface';

/**
 * Mutable view of a single Firestore transaction attempt.
 *
 * Obtained from {@link FirestoreBackend.runTransaction} or from
 * `TransactionInterface.getClient()` when the ambient Rockets transaction
 * was started by this adapter's factory.
 *
 * Firestore requires all reads before all writes inside one attempt and may
 * retry the whole attempt under contention — keep handlers idempotent.
 * Write count is capped at {@link FIRESTORE_MAX_TRANSACTION_WRITES}.
 */
export interface FirestoreTransactionHandle {
  get(
    collection: string,
    documentId: string,
  ): Promise<Record<string, unknown> | null>;
  create(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
    options?: { readonly skipExistenceRead?: boolean },
  ): Promise<void>;
  set(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
    merge?: boolean,
    precondition?: FirestoreWritePrecondition,
  ): Promise<void>;
  delete(
    collection: string,
    documentId: string,
    precondition?: FirestoreWritePrecondition,
  ): Promise<void>;
  queryBranch(
    collection: string,
    options: FirestoreBranchQueryOptions,
  ): Promise<Record<string, unknown>[]>;
  countBranch(
    collection: string,
    branch: FirestoreQueryBranch,
  ): Promise<number>;
}
