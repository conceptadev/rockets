import { LiteralObject, ReferenceAssigneeInterface } from '@concepta/ts-core';
import { Inject, Injectable } from '@nestjs/common';

import { InvitationServiceInterface } from '../interfaces/invitation.service.interface';
import { InvitationSettingsInterface } from '../interfaces/invitation-settings.interface';
import { InvitationOtpServiceInterface } from '../interfaces/invitation-otp.service.interface';
import { InvitationUserLookupServiceInterface } from '../interfaces/invitation-user-lookup.service.interface';
import { InvitationUserMutateServiceInterface } from '../interfaces/invitation-user-mutate.service.interface';
import {
  INVITATION_MODULE_SETTINGS_TOKEN,
  INVITATION_OTP_SERVICE_TOKEN,
  INVITATION_USER_LOOKUP_SERVICE_TOKEN,
  INVITATION_USER_MUTATE_SERVICE_TOKEN,
} from '../invitation.constants';
import { InvitationNotificationService } from './invitation-notification.service';
import { InvitationDto } from '../dto/invitation.dto';
import { InvitationEventService } from './invitation-event.service';

@Injectable()
export class InvitationService implements InvitationServiceInterface {
  constructor(
    @Inject(INVITATION_MODULE_SETTINGS_TOKEN)
    private readonly config: InvitationSettingsInterface,
    @Inject(INVITATION_OTP_SERVICE_TOKEN)
    private readonly otpService: InvitationOtpServiceInterface,
    @Inject(INVITATION_USER_LOOKUP_SERVICE_TOKEN)
    private readonly userLookupService: InvitationUserLookupServiceInterface,
    @Inject(INVITATION_USER_MUTATE_SERVICE_TOKEN)
    private readonly userMutateService: InvitationUserMutateServiceInterface,
    private readonly notificationService: InvitationNotificationService,
    private readonly invitationEventService: InvitationEventService,
  ) {}

  async sendInvite(
    userId: string,
    email: string,
    code: string,
    category: string,
  ): Promise<void> {
    const { assignment, type, expiresIn } = this.config.otp;
    // create an OTP save it in the database
    const otp = await this.otpService.create(assignment, {
      category,
      type,
      expiresIn,
      assignee: {
        id: userId,
      },
    });

    // send en email with a recover OTP
    await this.notificationService.sendInviteEmail(
      email,
      code,
      otp.passcode,
      otp.expirationDate,
    );
  }

  /**
   * Validate passcode and return it's user.
   *
   * @param passcode user's passcode
   * @param category
   * @param deleteIfValid flag to delete if valid or not
   */
  async validatePasscode(
    passcode: string,
    category: string,
    deleteIfValid = false,
  ): Promise<ReferenceAssigneeInterface | null> {
    // extract required properties
    const { assignment } = this.config.otp;

    // validate passcode return passcode's user was found
    return this.otpService.validate(
      assignment,
      { category, passcode },
      deleteIfValid,
    );
  }

  /**
   * Activate user's account by providing its OTP passcode and the new password.
   *
   */
  async acceptInvite(
    invitationDto: InvitationDto,
    passcode: string,
    payload?: LiteralObject,
  ): Promise<boolean> {
    const { category, email } = invitationDto;
    // get otp by passcode, but no delete it until all workflow pass
    const otp = await this.validatePasscode(passcode, category, true);

    // did we get an otp?
    if (otp) {
      const success = await this.invitationEventService.sendEvent(
        'acceptInvite',
        invitationDto,
        payload,
      );

      if (!success) {
        return false;
      }

      await this.notificationService.sendInviteAcceptedEmail(email);
      await this.revokeAllUserInvites(email, category);

      return true;
    }

    return false;
  }

  /**
   * Recover lost password providing an email and send the passcode token by email.
   *
   * @param email user email
   * @param category
   */
  async revokeAllUserInvites(email: string, category: string): Promise<void> {
    // recover the user by providing an email
    const user = await this.userLookupService.byEmail(email);

    // did we find a user?
    if (user) {
      // extract required otp properties
      const { assignment } = this.config.otp;
      // clear all user's otps in DB
      await this.otpService.clear(assignment, {
        category,
        assignee: {
          id: user.id,
        },
      });
    }

    // !!! Falling through to void is intentional              !!!!
    // !!! Do NOT give any indication if e-mail does not exist !!!!
  }
}
