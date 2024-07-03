import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { BaseService, QueryOptionsInterface } from '@concepta/typeorm-common';

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

export class InvitationRevocationService extends BaseService<InvitationEntityInterface> {
  constructor(
    @Inject(INVITATION_MODULE_SETTINGS_TOKEN)
    private readonly settings: InvitationSettingsInterface,
    @InjectDynamicRepository(INVITATION_MODULE_INVITATION_ENTITY_KEY)
    invitationRepo: Repository<InvitationEntityInterface>,
    @Inject(INVITATION_MODULE_OTP_SERVICE_TOKEN)
    private readonly otpService: InvitationOtpServiceInterface,
    @Inject(INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN)
    private readonly userLookupService: InvitationUserLookupServiceInterface,
  ) {
    super(invitationRepo);
  }

  /**
   * Revoke all invitations for email in category.
   *
   * @param email - user email
   * @param category - the cateogory
   */
  async revokeAll(
    email: string,
    category: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    // run in transaction
    return this.transaction(queryOptions).commit(async (transaction) => {
      // override the query options
      const nestedQueryOptions = { ...queryOptions, transaction };

      // get the user by email
      const user = await this.userLookupService.byEmail(
        email,
        nestedQueryOptions,
      );

      // did we find a user?
      if (user) {
        // delete all invitations
        await this.deleteAllInvitations(user, category, nestedQueryOptions);
        // clear all otps
        await this.clearAllOtps(user, category, nestedQueryOptions);
      }
    });
  }

  /**
   * Clear all user OTPs by category
   *
   * @param user - User object
   * @param category - Category
   */
  protected async clearAllOtps(
    user: ReferenceIdInterface,
    category: string,
    queryOptions?: QueryOptionsInterface,
  ) {
    // extract required otp properties
    const { assignment } = this.settings.otp;

    if (!assignment) {
      throw new InvitationException('OPT assignment setting was not defined');
    }

    // clear all user's otps in DB
    return this.otpService.clear(
      assignment,
      {
        category,
        assignee: {
          id: user.id,
        },
      },
      queryOptions,
    );
  }

  /**
   * Delete all user invitations by category.
   *
   * @param user - User object
   * @param category - Category
   */
  protected async deleteAllInvitations(
    user: ReferenceIdInterface,
    category: string,
    queryOptions?: QueryOptionsInterface,
  ) {
    let invitations: InvitationEntityInterface[];

    // get the repo
    const repo = this.repository(queryOptions);

    // run in transaction
    await this.transaction(queryOptions).commit(async () => {
      // find the invitations
      try {
        invitations = await repo.find({
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

      // remove the invitations
      try {
        return repo.remove(invitations);
      } catch (e: unknown) {
        throw new InvitationException(
          'Fatal error while removing invitations.',
          e,
        );
      }
    });
  }
}
