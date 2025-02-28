import { Injectable } from '@nestjs/common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

import { InvitationServiceInterface } from '../interfaces/invitation.service.interface';
import { InvitationAcceptanceService } from './invitation-acceptance.service';
import { InvitationSendService } from './invitation-send.service';
import { InvitationRevocationService } from './invitation-revocation.service';
import { InvitationInterface } from '@concepta/nestjs-common/src';
import { InvitationAcceptOptionsInterface } from '../interfaces/invitation-accept-options.interface';
import { InvitationRevokeOptionsInterface } from '../interfaces/invitation-revoke-options.interface';
import { InvitationCreatableInterface } from '../interfaces/invitation-creatable.interface';

@Injectable()
export class InvitationService implements InvitationServiceInterface {
  constructor(
    private readonly invitationSendService: InvitationSendService,
    private readonly invitationAcceptanceService: InvitationAcceptanceService,
    private readonly invitationRevocationService: InvitationRevocationService,
  ) {}
  async create(
    createDto: InvitationCreatableInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Required<Pick<InvitationInterface, 'id' | 'user'>>> {
    return this.invitationSendService.create(createDto, queryOptions);
  }

  async send(
    invitation: InvitationInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    return this.invitationSendService.send(invitation, queryOptions);
  }

  /**
   * Activate user's account by providing its OTP passcode and the new password.
   */
  async accept(
    options: InvitationAcceptOptionsInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<boolean> {
    return this.invitationAcceptanceService.accept(options, queryOptions);
  }

  /**
   * Revoke all invitations for a given email address in a specific category.
   *
   * @param options - The revocation options containing email and category
   * @param queryOptions - Optional query options for the transaction
   */
  async revokeAll(
    options: InvitationRevokeOptionsInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    return this.invitationRevocationService.revokeAll(options, queryOptions);
  }
}
