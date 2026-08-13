import type { RuntimeExceptionOptions } from '@concepta/nestjs-core';
import { RepositoryQueryException } from '@concepta/nestjs-repository';

/**
 * Thrown when a Firestore transaction is opened for one backend while another
 * backend's transaction is already ambient.
 *
 * A Firestore transaction belongs to a single database, so joining across
 * backends would give false atomicity: part of the unit would commit outside
 * the transaction.
 */
export class FirestoreTransactionBackendMismatchException extends RepositoryQueryException {
  constructor(
    message = 'Firestore transaction already active for a different backend — a transaction cannot span backends',
    options?: RuntimeExceptionOptions,
  ) {
    super('firestore-transaction', {
      message,
      messageParams: [],
      ...options,
    });
    this.errorCode = 'FIRESTORE_TRANSACTION_BACKEND_MISMATCH';
  }
}
