import { HttpStatus } from '@nestjs/common';
import { RuntimeExceptionOptions } from '@concepta/nestjs-core';
import { RepositoryQueryException } from '@concepta/nestjs-repository';

/**
 * Thrown by every {@link FirestoreBackend} implementation when `create()`
 * targets an id that already exists, so callers handle one error shape
 * regardless of backend and the exceptions filter can map it to HTTP 409.
 *
 * Extends {@link RepositoryQueryException} because the repository hook
 * permeator rethrows that family untouched — anything else gets wrapped
 * into a generic 500 before it reaches the exceptions filter.
 */
export class FirestoreDuplicateIdException extends RepositoryQueryException {
  constructor(
    collection: string,
    documentId: string,
    options?: RuntimeExceptionOptions,
  ) {
    super(collection, {
      message: `Firestore document "${collection}/${documentId}" already exists.`,
      messageParams: [],
      httpStatus: HttpStatus.CONFLICT,
      ...options,
    });
    this.errorCode = 'FIRESTORE_DUPLICATE_ID_ERROR';
  }
}
