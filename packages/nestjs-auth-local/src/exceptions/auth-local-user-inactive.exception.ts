import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { AuthLocalException } from './auth-local.exception';

export class AuthLocalUserInactiveException extends AuthLocalException {
  constructor(userName: string, options?: RuntimeExceptionOptions) {
    super({
      message: `User with username '%s' is inactive`,
      messageParams: [userName],
      httpStatus: HttpStatus.UNAUTHORIZED,
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_USER_INACTIVE_ERROR';
  }
}
