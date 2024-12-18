import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

/**
 * Generic auth verify exception.
 */
export class AuthVerifyException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'AUTH_VERIFY_ERROR';
  }
}
