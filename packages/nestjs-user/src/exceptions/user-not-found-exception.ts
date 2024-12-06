import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { UserException } from './user-exception';

export class UserNotFoundException extends UserException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'The user was not found',
      httpStatus: HttpStatus.NOT_FOUND,
      ...options,
    });

    this.errorCode = 'USER_NOT_FOUND_ERROR';
  }
}
