import type { RuntimeExceptionOptions } from '@concepta/nestjs-core';
import { RepositoryQueryException } from '@concepta/nestjs-repository';

/**
 * Thrown when Firestore retries a contended transaction attempt while the
 * imperative {@link FirestoreTransaction} bridge is in use.
 *
 * The bridge cannot re-execute application logic on retry; committing the
 * empty retry batch would silently drop writes. Prefer
 * `FirestoreBackend.runTransaction` for contended read-modify-write.
 */
export class FirestoreTransactionRetryUnsupportedException extends RepositoryQueryException {
  constructor(
    message = 'Firestore transaction retry is not supported by the imperative bridge — use backend.runTransaction() for contended read-modify-write',
    options?: RuntimeExceptionOptions,
  ) {
    super('firestore-transaction', {
      message,
      messageParams: [],
      ...options,
    });
    this.errorCode = 'FIRESTORE_TRANSACTION_RETRY_UNSUPPORTED';
  }
}
