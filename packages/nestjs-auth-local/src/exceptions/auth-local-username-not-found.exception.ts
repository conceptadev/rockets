import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { AuthLocalInvalidCredentialsException } from './auth-local-invalid-credentials.exception';

export class AuthLocalUsernameNotFoundException extends AuthLocalInvalidCredentialsException {
  constructor(userName: string, options?: RuntimeExceptionOptions) {
    super({
      message: `No user found for username: %s`,
      messageParams: [userName],
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_USERNAME_NOT_FOUND_ERROR';
  }
}
