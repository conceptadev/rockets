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
import {
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

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
  ) {}

  /**
   * Send app email invite to the new user.
   *
   * @param email user email
   */
  async sendInvite(email: string): Promise<void> {
    // recover the user by providing an email
    let user = await this.userLookupService.byEmail(email);

    if (!user) {
      user = await this.userMutateService.create({
        email,
        username: email,
      });
    }

    // did we find a user?
    if (user) {
      // extract required otp properties
      const { category, assignment, type, expiresIn } = this.config.otp;
      // create an OTP save it in the database
      const otp = await this.otpService.create(assignment, {
        category,
        type,
        expiresIn,
        assignee: {
          id: user.id,
        },
      });

      // send en email with a recover OTP
      await this.notificationService.sendInviteEmail(
        email,
        otp.passcode,
        otp.expirationDate,
      );
    }

    // !!! Falling through to void is intentional              !!!!
    // !!! Do NOT give any indication if e-mail does not exist !!!!
  }

  /**
   * Validate passcode and return it's user.
   *
   * @param passcode user's passcode
   * @param deleteIfValid flag to delete if valid or not
   */
  async validatePasscode(
    passcode: string,
    deleteIfValid = false,
  ): Promise<ReferenceAssigneeInterface | null> {
    // extract required properties
    const { category, assignment } = this.config.otp;

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
   * @param passcode OTP user's passcode
   * @param newPassword new user password
   */
  async acceptInvite(
    passcode: string,
    newPassword: string,
  ): Promise<ReferenceIdInterface | null> {
    // get otp by passcode, but no delete it until all workflow pass
    const otp = await this.validatePasscode(passcode);

    // did we get an otp?
    if (otp) {
      // call user mutate service
      const user = await this.userMutateService.update({
        id: otp.assignee.id,
        password: newPassword,
      });

      if (user) {
        await this.notificationService.sendInviteAcceptedEmail(user.email);
        await this.revokeAllUserInvites(user.email);
      }

      return user;
    }

    // otp was not found
    return null;
  }

  /**
   * Recover lost password providing an email and send the passcode token by email.
   *
   * @param email user email
   */
  async revokeAllUserInvites(email: string): Promise<void> {
    // recover the user by providing an email
    const user = await this.userLookupService.byEmail(email);

    // did we find a user?
    if (user) {
      // extract required otp properties
      const { category, assignment } = this.config.otp;
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
