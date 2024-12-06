import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { AuthLocalException } from './auth-local.exception';

export class AuthLocalUsernameNotFoundException extends AuthLocalException {
  constructor(userName: string, options?: RuntimeExceptionOptions) {
    super({
      message: `No user found for username: %s`,
      messageParams: [userName],
      httpStatus: HttpStatus.UNAUTHORIZED,
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_USERNAME_NOT_FOUND_ERROR';
  }
}
