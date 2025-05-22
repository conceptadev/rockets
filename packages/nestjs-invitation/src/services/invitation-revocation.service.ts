import { Inject } from '@nestjs/common';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import {
  RepositoryInterface,
  InjectDynamicRepository,
} from '@concepta/nestjs-common';

import {
  INVITATION_MODULE_INVITATION_ENTITY_KEY,
  INVITATION_MODULE_OTP_SERVICE_TOKEN,
  INVITATION_MODULE_SETTINGS_TOKEN,
  INVITATION_MODULE_USER_MODEL_SERVICE_TOKEN,
} from '../invitation.constants';

import { InvitationSettingsInterface } from '../interfaces/options/invitation-settings.interface';
import { InvitationOtpServiceInterface } from '../interfaces/services/invitation-otp-service.interface';
import { InvitationUserModelServiceInterface } from '../interfaces/services/invitation-user-model.service.interface';
import { InvitationEntityInterface } from '@concepta/nestjs-common';
import { InvitationException } from '../exceptions/invitation.exception';
import { InvitationRevokeOptionsInterface } from '../interfaces/options/invitation-revoke-options.interface';

export class InvitationRevocationService {
  constructor(
    @Inject(INVITATION_MODULE_SETTINGS_TOKEN)
    private readonly settings: InvitationSettingsInterface,
    @InjectDynamicRepository(INVITATION_MODULE_INVITATION_ENTITY_KEY)
    protected readonly invitationRepo: RepositoryInterface<InvitationEntityInterface>,
    @Inject(INVITATION_MODULE_OTP_SERVICE_TOKEN)
    private readonly otpService: InvitationOtpServiceInterface,
    @Inject(INVITATION_MODULE_USER_MODEL_SERVICE_TOKEN)
    private readonly userModelService: InvitationUserModelServiceInterface,
  ) {}

  /**
   * Revoke all invitations for a given email address in a specific category.
   *
   * @param options - The revocation options containing email and category
   */
  async revokeAll(options: InvitationRevokeOptionsInterface): Promise<void> {
    const { email, category } = options;
    // get the user by email
    const user = await this.userModelService.byEmail(email);

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
   * @param user - User object
   * @param category - Category
   */
  protected async clearAllOtps(user: ReferenceIdInterface, category: string) {
    // extract required otp properties
    const { assignment } = this.settings.otp;

    if (!assignment) {
      throw new InvitationException({
        message: 'OPT assignment setting was not defined',
      });
    }

    // clear all user's otps in DB
    return this.otpService.clear(assignment, {
      category,
      assigneeId: user.id,
    });
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
  ) {
    let invitations: InvitationEntityInterface[];

    try {
      invitations = await this.invitationRepo.find({
        where: {
          userId: user.id,
          category,
        },
      });
    } catch (e: unknown) {
      throw new InvitationException({
        message: 'Fatal error while looking up invitations to delete.',
        originalError: e,
      });
    }

    // remove the invitations
    try {
      return await this.invitationRepo.remove(invitations);
    } catch (e: unknown) {
      throw new InvitationException({
        message: 'Fatal error while removing invitations.',
        originalError: e,
      });
    }
  }
}
