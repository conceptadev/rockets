import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { InvitationException } from './invitation.exception';

/**
 * Generic invitation exception.
 */
export class InvitationNotFoundException extends InvitationException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      ...options,
      httpStatus: HttpStatus.NOT_FOUND,
    });
    this.errorCode = 'INVITATION_NOT_FOUND_ERROR';
  }
}
