import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { AuthHistoryException } from './auth-history-exception';

export class AuthHistoryBadRequestException extends AuthHistoryException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'AUTH_HISTORY_BAD_REQUEST_ERROR';
  }
}
