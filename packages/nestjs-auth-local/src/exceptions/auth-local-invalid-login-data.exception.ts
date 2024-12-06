import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class AuthLocalInvalidLoginDataException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage:
        'The provided username or password is incorrect. Please try again.',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_INVALID_LOGIN_DATA_ERROR';
  }
}
