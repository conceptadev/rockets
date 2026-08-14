import type { RuntimeExceptionOptions } from '@concepta/nestjs-core';
import { RepositoryQueryException } from '@concepta/nestjs-repository';

import { FIRESTORE_MAX_TRANSACTION_WRITES } from '../constants/firestore-transaction.constants';

/**
 * Thrown when a transactional unit exceeds Firestore's write limit.
 *
 * The adapter does not split oversized units — callers must chunk or use
 * {@link FirestoreBackend.writeBatch} for non-transactional bulk writes.
 */
export class FirestoreTransactionWriteLimitExceededException extends RepositoryQueryException {
  constructor(
    writeCount: number = FIRESTORE_MAX_TRANSACTION_WRITES + 1,
    options?: RuntimeExceptionOptions,
  ) {
    super('firestore-transaction', {
      message: `Firestore transaction write limit exceeded (${writeCount} > ${FIRESTORE_MAX_TRANSACTION_WRITES})`,
      messageParams: [],
      ...options,
    });
    this.errorCode = 'FIRESTORE_TRANSACTION_WRITE_LIMIT_EXCEEDED';
  }
}
