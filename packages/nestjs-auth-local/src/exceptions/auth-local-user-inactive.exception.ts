import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { AuthLocalInvalidCredentialsException } from './auth-local-invalid-credentials.exception';

export class AuthLocalUserInactiveException extends AuthLocalInvalidCredentialsException {
  constructor(userName: string, options?: RuntimeExceptionOptions) {
    super({
      message: `User with username '%s' is inactive`,
      messageParams: [userName],
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_USER_INACTIVE_ERROR';
  }
}
