import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';

/**
 * Exception for authentication
 */
export class AuthenticationException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      ...options,
      httpStatus: HttpStatus.BAD_REQUEST,
    });
    this.errorCode = 'AUTHENTICATION_ERROR';
  }
}
