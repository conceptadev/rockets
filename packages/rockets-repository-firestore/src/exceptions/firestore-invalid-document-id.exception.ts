import type { RuntimeExceptionOptions } from '@concepta/nestjs-core';
import { HttpStatus } from '@nestjs/common';
import { RepositoryQueryException } from '@concepta/nestjs-repository';

/**
 * Thrown when a uniqueDocumentIdField value cannot become a Firestore doc id.
 */
export class FirestoreInvalidDocumentIdException extends RepositoryQueryException {
  constructor(message: string, options?: RuntimeExceptionOptions) {
    super('firestore-document-id', {
      message,
      messageParams: [],
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });
    this.errorCode = 'FIRESTORE_INVALID_DOCUMENT_ID';
  }
}
