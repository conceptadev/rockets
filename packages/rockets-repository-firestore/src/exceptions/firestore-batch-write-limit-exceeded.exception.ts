import type { RuntimeExceptionOptions } from '@concepta/nestjs-core';
import { HttpStatus } from '@nestjs/common';
import { RepositoryQueryException } from '@concepta/nestjs-repository';

import { FIRESTORE_MAX_BATCH_WRITES } from '../constants/firestore-transaction.constants';

/**
 * Thrown when a WriteBatch exceeds Firestore's per-batch operation limit.
 */
export class FirestoreBatchWriteLimitExceededException extends RepositoryQueryException {
  constructor(
    operationCount: number = FIRESTORE_MAX_BATCH_WRITES + 1,
    options?: RuntimeExceptionOptions,
  ) {
    super('firestore-batch', {
      message: `Firestore writeBatch accepts at most ${FIRESTORE_MAX_BATCH_WRITES} operations (got ${operationCount})`,
      messageParams: [],
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });
    this.errorCode = 'FIRESTORE_BATCH_WRITE_LIMIT_EXCEEDED';
  }
}
