import type { RuntimeExceptionOptions } from '@concepta/nestjs-core';
import { RepositoryQueryException } from '@concepta/nestjs-repository';

/**
 * Signals that the imperative Firestore transaction bridge aborted without
 * committing. Swallowed by {@link FirestoreTransaction.rollback}; any other
 * error from the underlying `runTransaction` is rethrown.
 *
 * Extends {@link RepositoryQueryException} so the repository hook permeator
 * rethrows it untouched instead of wrapping it into a generic 500.
 */
export class FirestoreTransactionAbortedException extends RepositoryQueryException {
  constructor(options?: RuntimeExceptionOptions) {
    super('firestore-transaction', {
      message: 'Firestore transaction aborted',
      messageParams: [],
      ...options,
    });
    this.errorCode = 'FIRESTORE_TRANSACTION_ABORTED';
  }
}
