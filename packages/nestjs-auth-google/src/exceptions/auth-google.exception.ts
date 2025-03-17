import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
/**
 * Generic auth google exception.
 */
export class AuthGoogleException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'AUTH_GOOGLE_ERROR';
  }
}
