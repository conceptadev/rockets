import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { AuthenticationException } from './authentication.exception';

/**
 * Exception for authentication
 */
export class AuthenticationAccessTokenException extends AuthenticationException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Access token was verified, but failed further validation.',
      ...options,
    });
    this.errorCode = 'AUTHENTICATION_TOKEN_ERROR';
  }
}
