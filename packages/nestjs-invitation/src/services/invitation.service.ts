import { LiteralObject } from '@concepta/ts-core';
import { Injectable } from '@nestjs/common';

import { InvitationServiceInterface } from '../interfaces/invitation.service.interface';
import { InvitationAcceptanceService } from './invitation-acceptance.service';
import { InvitationSendService } from './invitation-send.service';
import { InvitationRevocationService } from './invitation-revocation.service';
import { InvitationDto } from '../dto/invitation.dto';

@Injectable()
export class InvitationService implements InvitationServiceInterface {
  constructor(
    private readonly invitationSendService: InvitationSendService,
    private readonly invitationAcceptanceService: InvitationAcceptanceService,
    private readonly invitationRevocationService: InvitationRevocationService,
  ) {}

  async send(
    userId: string,
    email: string,
    code: string,
    category: string,
  ): Promise<void> {
    return this.invitationSendService.send(userId, email, code, category);
  }

  /**
   * Activate user's account by providing its OTP passcode and the new password.
   */
  async accept(
    invitationDto: InvitationDto,
    passcode: string,
    payload?: LiteralObject,
  ): Promise<boolean> {
    return this.invitationAcceptanceService.accept(
      invitationDto,
      passcode,
      payload,
    );
  }

  /**
   * Revoke all invitations by email and category.
   *
   * @param email user email
   * @param category
   */
  async revokeAll(email: string, category: string): Promise<void> {
    return this.invitationRevocationService.revokeAll(email, category);
  }
}
