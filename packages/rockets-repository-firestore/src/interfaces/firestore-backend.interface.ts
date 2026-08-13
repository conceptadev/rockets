import type {
  FirestoreOrderBy,
  FirestoreQueryBranch,
} from './firestore-query.interface';
import type { FirestoreTransactionHandle } from './firestore-transaction-handle.interface';
import type { FirestoreWritePrecondition } from './firestore-write.interface';

/** @deprecated Use {@link FirestoreQueryFilter} via {@link FirestoreQueryBranch}. */
export interface FirestoreEqualityFilter {
  readonly field: string;
  readonly value: unknown;
}

export interface FirestoreBranchQueryOptions {
  readonly branch: FirestoreQueryBranch;
  readonly orderBy?: readonly FirestoreOrderBy[];
  readonly skip?: number;
  readonly take?: number;
}

export type FirestoreBatchOperation =
  | {
      readonly op: 'create';
      readonly collection: string;
      readonly id: string;
      readonly data: Record<string, unknown>;
    }
  | {
      readonly op: 'delete';
      readonly collection: string;
      readonly id: string;
    };

export interface FirestoreBackend {
  get(
    collection: string,
    documentId: string,
  ): Promise<Record<string, unknown> | null>;
  /**
   * Atomically create a document.
   *
   * @throws FirestoreDuplicateIdException when the id already exists —
   * every implementation must translate its native duplicate error into
   * this exception at the boundary.
   */
  create(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
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
  /**
   * Run `fn` inside a single atomic unit. Admin backends map this to
   * `Firestore.runTransaction`; the in-memory backend uses a copy-on-write
   * snapshot. Prefer this callback form for contended read-modify-write —
   * the imperative `TransactionInterface` bridge cannot re-run the handler
   * body when Firestore retries an attempt.
   */
  runTransaction<T>(
    fn: (tx: FirestoreTransactionHandle) => Promise<T>,
  ): Promise<T>;
  /**
   * Atomic multi-write (Admin WriteBatch). Max 500 ops per call; chunk
   * larger units yourself. Not available inside a transaction — use the
   * ambient handle sequentially instead.
   *
   * @throws FirestoreDuplicateIdException when any create targets an
   * existing id (whole batch rolls back).
   */
  writeBatch(operations: readonly FirestoreBatchOperation[]): Promise<void>;
}
