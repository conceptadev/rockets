import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class CurrentPasswordRequiredException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Current password is required',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'PASSWORD_CURRENT_REQUIRED_ERROR';
  }
}
