import { HttpStatus } from '@nestjs/common';
import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { AuthLocalException } from './auth-local.exception';

export class AuthLocalInvalidLoginDataException extends AuthLocalException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Data validation error occurred before user validation.',
      safeMessage:
        'The provided username or password is incorrect. Please try again.',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_INVALID_LOGIN_DATA_ERROR';
  }
}
