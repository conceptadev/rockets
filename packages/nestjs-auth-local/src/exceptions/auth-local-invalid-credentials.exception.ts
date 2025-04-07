import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { AuthLocalUnauthorizedException } from './auth-local-unauthorized.exception';

export class AuthLocalInvalidCredentialsException extends AuthLocalUnauthorizedException {
  constructor(options?: Omit<RuntimeExceptionOptions, 'httpStatus'>) {
    super({
      safeMessage:
        'The provided username or password is incorrect. Please try again.',
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_INVALID_CREDENTIALS_ERROR';
  }
}
