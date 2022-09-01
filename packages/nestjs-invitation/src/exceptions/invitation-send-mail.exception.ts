import { ExceptionInterface, mapNonErrorToException } from '@concepta/ts-core';

/**
 * Thrown when an error occurs while attempting to deliver email.
 */
export class InvitationSendMailException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'INVITATION_SEND_MAIL_ERROR';

  context: {
    emailAddress: string;
    originalError: Error;
  };

  constructor(
    originalError: unknown,
    emailAddress: string,
    message = 'Error while trying to send invitation related email',
  ) {
    super(message);
    this.context = {
      emailAddress,
      originalError: mapNonErrorToException(originalError),
    };
  }
}
