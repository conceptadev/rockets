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

    this.errorCode = 'CURRENT_PASSWORD_REQUIRED_ERROR';
  }
}
