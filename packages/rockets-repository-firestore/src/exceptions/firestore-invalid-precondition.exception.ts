import type { RuntimeExceptionOptions } from '@concepta/nestjs-core';
import { HttpStatus } from '@nestjs/common';
import { RepositoryQueryException } from '@concepta/nestjs-repository';

/**
 * Thrown when a write precondition is malformed (e.g. both `exists` and
 * `lastUpdateTime` set) or unsupported on the requested operation.
 */
export class FirestoreInvalidPreconditionException extends RepositoryQueryException {
  constructor(message: string, options?: RuntimeExceptionOptions) {
    super('firestore-write', {
      message,
      messageParams: [],
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });
    this.errorCode = 'FIRESTORE_INVALID_PRECONDITION';
  }
}
