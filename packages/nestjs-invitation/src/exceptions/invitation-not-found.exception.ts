import { HttpStatus } from '@nestjs/common';
import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { InvitationException } from './invitation.exception';

/**
 * Generic invitation exception.
 */
export class InvitationNotFoundException extends InvitationException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      httpStatus: HttpStatus.NOT_FOUND,
      ...options,
    });
    this.errorCode = 'INVITATION_NOT_FOUND_ERROR';
  }
}
