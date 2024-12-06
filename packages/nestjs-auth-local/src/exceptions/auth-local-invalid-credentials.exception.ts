import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { AuthLocalException } from './auth-local.exception';

export class AuthLocalInvalidCredentialsException extends AuthLocalException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'The provided credentials are incorrect. Please try again.',
      httpStatus: HttpStatus.UNAUTHORIZED,
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_INVALID_CREDENTIALS_ERROR';
  }
}
