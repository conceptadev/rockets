import { HttpStatus } from '@nestjs/common';
import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { PasswordException } from './password.exception';

export class CurrentPasswordRequiredException extends PasswordException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Current password is required',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'PASSWORD_CURRENT_REQUIRED_ERROR';
  }
}
