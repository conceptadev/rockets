import { ExceptionInterface, mapNonErrorToException } from '@concepta/ts-core';

/**
 * Generic invitation exception.
 */
export class InvitationException extends Error implements ExceptionInterface {
  errorCode = 'INVITATION_ERROR';

  context: {
    originalError?: Error;
  };

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.context = {
      originalError:
        typeof originalError !== undefined
          ? mapNonErrorToException(originalError)
          : undefined,
    };
  }
}
