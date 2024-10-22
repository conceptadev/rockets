import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class PasswordNotStrongException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Password is not strong enough',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'PASSWORD_NOT_STRONG_ERROR';
  }
}
