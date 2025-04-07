import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { AuthLocalInvalidCredentialsException } from './auth-local-invalid-credentials.exception';

export class AuthLocalInvalidPasswordException extends AuthLocalInvalidCredentialsException {
  constructor(userName: string, options?: RuntimeExceptionOptions) {
    super({
      message: `Invalid password for username: %s`,
      messageParams: [userName],
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_INVALID_PASSWORD_ERROR';
  }
}
