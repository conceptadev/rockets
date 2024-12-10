import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { AuthenticationException } from './authentication.exception';

/**
 * Exception for authentication
 */
export class AuthenticationRefreshTokenException extends AuthenticationException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Refresh token was verified, but failed further validation.',
      ...options,
    });
    this.errorCode = 'AUTHENTICATION_TOKEN_ERROR';
  }
}
