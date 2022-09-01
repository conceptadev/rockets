import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';

import {
  INVITATION_MODULE_INVITATION_ENTITY_KEY,
  INVITATION_MODULE_OTP_SERVICE_TOKEN,
  INVITATION_MODULE_SETTINGS_TOKEN,
  INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN,
} from '../invitation.constants';

import { InvitationSettingsInterface } from '../interfaces/invitation-settings.interface';
import { InvitationOtpServiceInterface } from '../interfaces/invitation-otp.service.interface';
import { InvitationUserLookupServiceInterface } from '../interfaces/invitation-user-lookup.service.interface';
import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';
import { InvitationException } from '../exceptions/invitation.exception';

export class InvitationRevocationService {
  constructor(
    @Inject(INVITATION_MODULE_SETTINGS_TOKEN)
    private readonly settings: InvitationSettingsInterface,
    @InjectDynamicRepository(INVITATION_MODULE_INVITATION_ENTITY_KEY)
    private readonly invitationRepo: Repository<InvitationEntityInterface>,
    @Inject(INVITATION_MODULE_OTP_SERVICE_TOKEN)
    private readonly otpService: InvitationOtpServiceInterface,
    @Inject(INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN)
    private readonly userLookupService: InvitationUserLookupServiceInterface,
  ) {}

  /**
   * Revoke all invitations for email in category.
   *
   * @param email user email
   * @param category
   */
  async revokeAll(email: string, category: string): Promise<void> {
    // get the user by email
    const user = await this.userLookupService.byEmail(email);

    // did we find a user?
    if (user) {
      // delete all invitations
      await this.deleteAllInvitations(user, category);
      // clear all otps
      await this.clearAllOtps(user, category);
    }
  }

  /**
   * Clear all user OTPs by category
   *
   * @param user
   * @param category
   */
  protected async clearAllOtps(user: ReferenceIdInterface, category: string) {
    // extract required otp properties
    const { assignment } = this.settings.otp;

    if (!assignment) {
      throw new InvitationException('OPT assignment setting was not defined');
    }

    // clear all user's otps in DB
    return this.otpService.clear(assignment, {
      category,
      assignee: {
        id: user.id,
      },
    });
  }

  /**
   * Delete all user invitations by category.
   *
   * @param user
   * @param category
   */
  protected async deleteAllInvitations(
    user: ReferenceIdInterface,
    category: string,
  ) {
    let invitations: InvitationEntityInterface[];

    try {
      invitations = await this.invitationRepo.find({
        where: {
          user: { id: user.id },
          category,
        },
      });
    } catch (e: unknown) {
      throw new InvitationException(
        'Fatal error while looking up invitations to delete.',
        e,
      );
    }

    try {
      return this.invitationRepo.remove(invitations);
    } catch (e: unknown) {
      throw new InvitationException(
        'Fatal error while removing invitations.',
        e,
      );
    }
  }
}
