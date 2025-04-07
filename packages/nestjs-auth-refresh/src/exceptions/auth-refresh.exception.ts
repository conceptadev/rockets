import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';

/**
 * Generic auth refresh exception.
 */
export class AuthRefreshException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'AUTH_REFRESH_ERROR';
  }
}
