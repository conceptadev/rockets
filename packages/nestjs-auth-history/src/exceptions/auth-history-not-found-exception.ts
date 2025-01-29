import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { AuthHistoryException } from './auth-history-exception';

export class AuthHistoryNotFoundException extends AuthHistoryException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'The login history was not found',
      httpStatus: HttpStatus.NOT_FOUND,
      ...options,
    });

    this.errorCode = 'AUTH_HISTORY_NOT_FOUND_ERROR';
  }
}
