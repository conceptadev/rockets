import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';

/**
 * Generic auth local exception.
 */
export class AuthLocalException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'AUTH_LOCAL_ERROR';
  }
}
