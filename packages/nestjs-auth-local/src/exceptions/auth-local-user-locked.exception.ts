import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { AuthLocalInvalidCredentialsException } from './auth-local-invalid-credentials.exception';

export class AuthLocalUserLockedException extends AuthLocalInvalidCredentialsException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: `Your account has been locked due to multiple failed login attempts. Please contact support to unlock your account`,
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_USER_LOCKED_ERROR';
  }
}
