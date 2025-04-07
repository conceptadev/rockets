import { HttpStatus } from '@nestjs/common';
import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
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
