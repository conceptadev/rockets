import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';
import { InvitationException } from './invitation.exception';

/**
 * Thrown when an error occurs while attempting to deliver email.
 */
export class InvitationSendMailException extends InvitationException {
  context: RuntimeException['context'] & {
    emailAddress: string;
  };

  // TODO: this is receiving email, but not using, should update
  // message or remove email from constructor
  constructor(emailAddress: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to send invitation related email',
      ...options,
    });
    this.errorCode = 'INVITATION_SEND_MAIL_ERROR';
    this.context = {
      ...super.context,
      emailAddress,
    };
  }
}
