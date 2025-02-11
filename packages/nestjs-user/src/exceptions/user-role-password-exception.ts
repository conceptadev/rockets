import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { UserException } from './user-exception';

export class UserRolePasswordException extends UserException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Unable to get password strength for role',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'USER_ROLES_ERROR';
  }
}
