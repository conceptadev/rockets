import { HttpStatus } from '@nestjs/common';
import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { AuthLocalException } from './auth-local.exception';

export class AuthLocalMissingPasswordFieldException extends AuthLocalException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message:
        'Login password field is required, did someone remove the default?',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_MISSING_PASSWORD_FIELD_ERROR';
  }
}
