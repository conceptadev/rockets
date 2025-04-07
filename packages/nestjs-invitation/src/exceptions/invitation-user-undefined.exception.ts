import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { InvitationException } from './invitation.exception';

/**
 * Generic invitation exception.
 */
export class InvitationUserUndefinedException extends InvitationException {
  static errorMessage =
    'Cant receive a valid user from user user module. Check invitation and user module configuration';

  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: InvitationUserUndefinedException.errorMessage,
      ...options,
    });
    this.errorCode = 'INVITATION_USER_UNDEFINED_ERROR';
  }
}
