import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'The user was not found',
      httpStatus: HttpStatus.NOT_FOUND,
      ...options,
    });

    this.errorCode = 'USER_NOT_FOUND_ERROR';
  }
}
