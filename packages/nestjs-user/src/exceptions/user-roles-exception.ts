import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { UserException } from './user-exception';

export class UserRolesException extends UserException {
  constructor(userId: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Unable to get user roles for user ${userId}',
      messageParams: [userId],
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'USER_ROLES_ERROR';
  }
}
