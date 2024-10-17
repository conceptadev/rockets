import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class InvalidLoginDataException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message:
        'The provided username or password is incorrect. Please try again.',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_INVALID_LOGIN_DATA_ERROR';
  }
}
