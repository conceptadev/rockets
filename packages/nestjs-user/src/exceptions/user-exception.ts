import { ExceptionInterface, mapNonErrorToException } from '@concepta/ts-core';

/**
 * Generic user exception.
 */
export class UserException extends Error implements ExceptionInterface {
  errorCode = 'USER_ERROR';

  context: {
    message: string;
    originalError: Error;
  };

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.context = {
      message,
      originalError: mapNonErrorToException(originalError),
    };
  }
}
