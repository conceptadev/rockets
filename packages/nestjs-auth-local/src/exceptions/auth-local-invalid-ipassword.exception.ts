import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { AuthLocalException } from './auth-local.exception';

export class AuthLocalInvalidPasswordException extends AuthLocalException {
  constructor(userName: string, options?: RuntimeExceptionOptions) {
    super({
      message: `Invalid password for username: %s`,
      messageParams: [userName],
      httpStatus: HttpStatus.UNAUTHORIZED,
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_INVALID_PASSWORD_ERROR';
  }
}
