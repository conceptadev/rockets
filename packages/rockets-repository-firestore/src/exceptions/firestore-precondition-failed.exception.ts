import type { RuntimeExceptionOptions } from '@concepta/nestjs-core';
import { HttpStatus } from '@nestjs/common';
import { RepositoryQueryException } from '@concepta/nestjs-repository';

/**
 * Thrown when a write precondition fails (wrong `lastUpdateTime` / exists).
 */
export class FirestorePreconditionFailedException extends RepositoryQueryException {
  constructor(
    collection: string,
    documentId: string,
    options?: RuntimeExceptionOptions,
  ) {
    super(collection, {
      message: `Firestore precondition failed for "${collection}/${documentId}".`,
      messageParams: [],
      httpStatus: HttpStatus.PRECONDITION_FAILED,
      ...options,
    });
    this.errorCode = 'FIRESTORE_PRECONDITION_FAILED';
  }
}
