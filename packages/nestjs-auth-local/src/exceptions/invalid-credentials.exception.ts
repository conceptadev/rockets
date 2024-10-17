import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class InvalidCredentialsException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'The provided credentials are incorrect. Please try again.',
      httpStatus: HttpStatus.UNAUTHORIZED,
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_INVALID_CREDENTIALS_ERROR';
  }
}
