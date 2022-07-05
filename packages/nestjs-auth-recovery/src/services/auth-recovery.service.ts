import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AuthRecoveryInterface } from '../interfaces/auth-recovery.interface';
import { AuthRecoverySettingsInterface } from '../interfaces/auth-recovery-settings.interface';
import { AuthRecoveryOtpServiceInterface } from '../interfaces/auth-recovery-otp.service.interface';
import { AuthRecoveryUserLookupServiceInterface } from '../interfaces/auth-recovery-user-lookup.service.interface';
import { AuthRecoveryUserMutateServiceInterface } from '../interfaces/auth-recovery-user-mutate.service.interface';
import {
  AUTH_RECOVERY_MODULE_SETTINGS_TOKEN,
  AUTH_RECOVERY_OTP_SERVICE_TOKEN,
  AUTH_RECOVERY_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_RECOVERY_USER_MUTATE_SERVICE_TOKEN,
} from '../auth-recovery.constants';
import { AuthRecoveryNotificationService } from './auth-recovery-notification.service';
import { ReferenceAssigneeInterface } from '@concepta/ts-core';

@Injectable()
export class AuthRecoveryService implements AuthRecoveryInterface {
  constructor(
    @Inject(AUTH_RECOVERY_MODULE_SETTINGS_TOKEN)
    private readonly config: AuthRecoverySettingsInterface,
    @Inject(AUTH_RECOVERY_OTP_SERVICE_TOKEN)
    private readonly otpService: AuthRecoveryOtpServiceInterface,
    private readonly notificationService: AuthRecoveryNotificationService,
    @Inject(AUTH_RECOVERY_USER_LOOKUP_SERVICE_TOKEN)
    private readonly userLookupService: AuthRecoveryUserLookupServiceInterface,
    @Inject(AUTH_RECOVERY_USER_MUTATE_SERVICE_TOKEN)
    private readonly userMutateService: AuthRecoveryUserMutateServiceInterface,
  ) {}

  /**
   * Recover lost username providing an email and send the username by email
   * @param email user email
   */
  async recoverLogin(email: string): Promise<void> {
    // recover the user by providing an email
    const user = await this.userLookupService.byEmail(email);
    if (!user) {
      // thrown an error if the user is not found
      throw new NotFoundException(`email: ${email} not found`);
    }
    // send en email with the recovered login
    await this.notificationService.sendRecoverLoginEmail(email, user.username);
  }

  /**
   * Recover lost password providing an email and send the passcode token by email
   * @param email user email
   */
  async recoverPassword(email: string): Promise<void> {
    // recover the user by providing an email
    const user = await this.userLookupService.byEmail(email);
    if (!user) {
      // thrown an error if the user is not found
      throw new NotFoundException(`email: ${email} not found`);
    }
    // extract required properties
    const { id } = user;
    const { category, assignment, type } = this.config.otp;
    // create an OTP save it in the database
    const otpCreateDto = await this.otpService.create(assignment, {
      category,
      type,
      assignee: {
        id,
      },
    });
    const { passcode } = otpCreateDto;
    // send en email with a recover OTP
    await this.notificationService.sendRecoverPasswordEmail(
      email,
      passcode,
      otpCreateDto.expirationDate,
    );
  }

  /**
   * Validate passcode and return it's user
   * @param passcode user's passcode
   * @return {Promise<ReferenceAssigneeInterface | null>} otp found or not
   */
  async validatePasscode(
    passcode: string,
  ): Promise<ReferenceAssigneeInterface | null> {
    // extract required properties
    const { category, assignment } = this.config.otp;

    // validate passcode return passcode's user was found
    return await this.otpService.validate(
      assignment,
      { category, passcode },
      false,
    );
  }

  /**
   * Change use's password by providing it's OTP passcode and the new password
   * @param passcode OTP user's passcode
   * @param newPassword new user password
   */
  async updatePassword(passcode: string, newPassword: string): Promise<void> {
    // get otp by passcode
    const otp = await this.validatePasscode(passcode);
    if (!otp) {
      // throw error if the otp was not found
      throw new NotFoundException(`passcode not found`);
    }
    // update user password
    await this.userMutateService.update({
      id: otp.assignee.id,
      password: newPassword,
    });
  }
}
