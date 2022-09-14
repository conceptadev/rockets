import { ExceptionInterface, mapNonErrorToException } from '@concepta/ts-core';

/**
 * Generic invitation exception.
 */
export class InvitationUserUndefinedException
  extends Error
  implements ExceptionInterface
{
  static errorMessage =
    'Cant receive a valid user from user user module. Check invitation and user module configuration';
  errorCode = 'INVITATION_USER_UNDEFINED_ERROR';

  context: {
    originalError?: Error;
  };

  constructor(
    message = InvitationUserUndefinedException.errorMessage,
    originalError?: unknown,
  ) {
    super(message);
    this.context = {
      originalError:
        typeof originalError !== undefined
          ? mapNonErrorToException(originalError)
          : undefined,
    };
  }
}
