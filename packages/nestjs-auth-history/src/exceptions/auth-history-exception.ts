import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
/**
 * Generic login history exception.
 */
export class AuthHistoryException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'AUTH_HISTORY_ERROR';
  }
}
