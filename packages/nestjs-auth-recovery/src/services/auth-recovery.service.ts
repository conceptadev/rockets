import { Inject, Injectable } from '@nestjs/common';

import { AuthRecoveryServiceInterface } from '../interfaces/auth-recovery.service.interface';
import { AuthRecoverySettingsInterface } from '../interfaces/auth-recovery-settings.interface';
import { AuthRecoveryOtpServiceInterface } from '../interfaces/auth-recovery-otp.service.interface';
import { AuthRecoveryUserLookupServiceInterface } from '../interfaces/auth-recovery-user-lookup.service.interface';
import { AuthRecoveryUserMutateServiceInterface } from '../interfaces/auth-recovery-user-mutate.service.interface';
import {
  AUTH_RECOVERY_MODULE_SETTINGS_TOKEN,
  AUTH_RECOVERY_MODULE_OTP_SERVICE_TOKEN,
  AUTH_RECOVERY_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_RECOVERY_MODULE_USER_MUTATE_SERVICE_TOKEN,
} from '../auth-recovery.constants';
import { AuthRecoveryNotificationService } from './auth-recovery-notification.service';
import {
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

@Injectable()
export class AuthRecoveryService implements AuthRecoveryServiceInterface {
  constructor(
    @Inject(AUTH_RECOVERY_MODULE_SETTINGS_TOKEN)
    private readonly config: AuthRecoverySettingsInterface,
    @Inject(AUTH_RECOVERY_MODULE_OTP_SERVICE_TOKEN)
    private readonly otpService: AuthRecoveryOtpServiceInterface,
    @Inject(AUTH_RECOVERY_MODULE_USER_LOOKUP_SERVICE_TOKEN)
    private readonly userLookupService: AuthRecoveryUserLookupServiceInterface,
    @Inject(AUTH_RECOVERY_MODULE_USER_MUTATE_SERVICE_TOKEN)
    private readonly userMutateService: AuthRecoveryUserMutateServiceInterface,
    private readonly notificationService: AuthRecoveryNotificationService,
  ) {}

  /**
   * Recover lost username providing an email and send the username by email.
   *
   * @param email user email
   */
  async recoverLogin(email: string): Promise<void> {
    // recover the user by providing an email
    const user = await this.userLookupService.byEmail(email);

    // did we find the user?
    if (user) {
      // yes, send an email with the recovered login
      await this.notificationService.sendRecoverLoginEmail(
        email,
        user.username,
      );
    }

    // !!! Falling through to void is intentional              !!!!
    // !!! Do NOT give any indication if e-mail does not exist !!!!
  }

  /**
   * Recover lost password providing an email and send the passcode token by email.
   *
   * @param email user email
   */
  async recoverPassword(email: string): Promise<void> {
    // recover the user by providing an email
    const user = await this.userLookupService.byEmail(email);

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
      await this.notificationService.sendRecoverPasswordEmail(
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
   * Change user's password by providing it's OTP passcode and the new password.
   *
   * @param passcode OTP user's passcode
   * @param newPassword new user password
   */
  async updatePassword(
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
        await this.notificationService.sendPasswordUpdatedSuccefullyEmail(
          user.email,
        );
        await this.revokeAllUserPasswordRecoveries(user.email);
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
  async revokeAllUserPasswordRecoveries(email: string): Promise<void> {
    // recover users password by providing an email
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
