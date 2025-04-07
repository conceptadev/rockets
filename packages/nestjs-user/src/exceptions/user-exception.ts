import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';
/**
 * Generic user exception.
 */
export class UserException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'USER_ERROR';
  }
}
