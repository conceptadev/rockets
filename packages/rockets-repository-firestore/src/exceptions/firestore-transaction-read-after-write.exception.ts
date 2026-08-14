import type { RuntimeExceptionOptions } from '@concepta/nestjs-core';
import { HttpStatus } from '@nestjs/common';
import { RepositoryQueryException } from '@concepta/nestjs-repository';

/**
 * Thrown when a Firestore transaction performs a read after a write in the
 * same attempt (SDK rule: all reads before all writes).
 */
export class FirestoreTransactionReadAfterWriteException extends RepositoryQueryException {
  constructor(
    message = 'Firestore transactions require all reads before all writes',
    options?: RuntimeExceptionOptions,
  ) {
    super('firestore-transaction', {
      message,
      messageParams: [],
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });
    this.errorCode = 'FIRESTORE_TRANSACTION_READ_AFTER_WRITE';
  }
}
