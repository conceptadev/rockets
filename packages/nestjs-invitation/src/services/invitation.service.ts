import { Injectable } from '@nestjs/common';
import { InvitationInterface } from '@concepta/nestjs-common';

import { InvitationServiceInterface } from '../interfaces/services/invitation-service.interface';
import { InvitationAcceptanceService } from './invitation-acceptance.service';
import { InvitationSendService } from './invitation-send.service';
import { InvitationRevocationService } from './invitation-revocation.service';
import { InvitationAcceptOptionsInterface } from '../interfaces/options/invitation-accept-options.interface';
import { InvitationRevokeOptionsInterface } from '../interfaces/options/invitation-revoke-options.interface';
import { InvitationCreateInviteInterface } from '../interfaces/domain/invitation-create-invite.interface';

@Injectable()
export class InvitationService implements InvitationServiceInterface {
  constructor(
    private readonly invitationSendService: InvitationSendService,
    private readonly invitationAcceptanceService: InvitationAcceptanceService,
    private readonly invitationRevocationService: InvitationRevocationService,
  ) {}
  async create(createInviteDto: InvitationCreateInviteInterface) {
    return this.invitationSendService.create(createInviteDto);
  }

  async send(invitation: Pick<InvitationInterface, 'id'>): Promise<void> {
    return this.invitationSendService.send(invitation);
  }

  /**
   * Activate user's account by providing its OTP passcode and the new password.
   */
  async accept(options: InvitationAcceptOptionsInterface): Promise<boolean> {
    return this.invitationAcceptanceService.accept(options);
  }

  /**
   * Revoke all invitations for a given email address in a specific category.
   *
   * @param options - The revocation options containing email and category
   */
  async revokeAll(options: InvitationRevokeOptionsInterface): Promise<void> {
    return this.invitationRevocationService.revokeAll(options);
  }
}
