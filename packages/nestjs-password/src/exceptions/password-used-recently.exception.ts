import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class PasswordUsedRecentlyException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message:
        'The new password has been used too recently, please use a different password',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'PASSWORD_USED_RECENTLY_ERROR';
  }
}
