import { HttpStatus } from '@nestjs/common';
import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { UserException } from './user-exception';

export class UserBadRequestException extends UserException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'USER_BAD_REQUEST_ERROR';
  }
}
