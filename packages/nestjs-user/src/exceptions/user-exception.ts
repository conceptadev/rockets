import { mapNonErrorToException } from '@concepta/ts-core';
import { RuntimeException } from '@concepta/nestjs-exception';
/**
 * Generic user exception.
 */
export class UserException extends RuntimeException {
  constructor(message: string, originalError?: unknown) {
    super({
      message,
      originalError: mapNonErrorToException(originalError),
    });
    this.errorCode = 'USER_ERROR';
  }
}
