import {
  LiteralObject,
  ReferenceEmailInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { Injectable } from '@nestjs/common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

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
    user: ReferenceIdInterface & ReferenceEmailInterface,
    code: string,
    category: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    return this.invitationSendService.send(user, code, category, queryOptions);
  }

  /**
   * Activate user's account by providing its OTP passcode and the new password.
   */
  async accept(
    invitationDto: InvitationDto,
    passcode: string,
    payload?: LiteralObject,
    queryOptions?: QueryOptionsInterface,
  ): Promise<boolean> {
    return this.invitationAcceptanceService.accept(
      invitationDto,
      passcode,
      payload,
      queryOptions,
    );
  }

  /**
   * Revoke all invitations by email and category.
   *
   * @param email - user email
   * @param category - the category
   */
  async revokeAll(
    email: string,
    category: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    return this.invitationRevocationService.revokeAll(
      email,
      category,
      queryOptions,
    );
  }
}
