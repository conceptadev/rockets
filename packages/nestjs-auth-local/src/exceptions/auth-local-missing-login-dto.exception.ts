import { HttpStatus } from '@nestjs/common';
import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { AuthLocalException } from './auth-local.exception';

export class AuthLocalMissingLoginDtoException extends AuthLocalException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Login DTO is required, did someone remove the default?',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_MISSING_LOGIN_DTO_ERROR';
  }
}
