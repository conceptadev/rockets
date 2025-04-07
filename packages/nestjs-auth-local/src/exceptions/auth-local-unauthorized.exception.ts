import { HttpStatus } from '@nestjs/common';
import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { AuthLocalException } from './auth-local.exception';

export class AuthLocalUnauthorizedException extends AuthLocalException {
  constructor(options?: Omit<RuntimeExceptionOptions, 'httpStatus'>) {
    super({
      message: 'Unauthorized',
      safeMessage: 'Unauthorized',
      ...options,
      httpStatus: HttpStatus.UNAUTHORIZED,
    });

    this.errorCode = 'AUTH_LOCAL_UNAUTHORIZED_ERROR';
  }
}
