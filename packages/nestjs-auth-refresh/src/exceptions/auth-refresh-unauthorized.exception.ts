import { HttpStatus } from '@nestjs/common';
import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { AuthRefreshException } from './auth-refresh.exception';

export class AuthRefreshUnauthorizedException extends AuthRefreshException {
  constructor(options?: Omit<RuntimeExceptionOptions, 'httpStatus'>) {
    super({
      message: `Unauthorized refresh attempt`,
      ...options,
      httpStatus: HttpStatus.UNAUTHORIZED,
    });

    this.errorCode = 'AUTH_REFRESH_NOT_AUTHORIZED_ERROR';
  }
}
