import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AuthRecoveryInterface } from '../interfaces/auth-recovery.interface';
import { AuthRecoverySettingsInterface } from '../interfaces/auth-recovery-settings.interface';
import { OtpServiceInterface } from '../interfaces/otp-service.interface';
import { AuthRecoveryUserLookupServiceInterface } from '../interfaces/auth-recovery-user-lookup-service.interface';
import { AuthRecoveryUserMutateServiceInterface } from '../interfaces/auth-recovery-user-mutate-service.interface';
import {
  AUTH_RECOVERY_MODULE_SETTINGS_TOKEN,
  AUTH_RECOVERY_OTP_SERVICE_TOKEN,
  AUTH_RECOVERY_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_RECOVERY_USER_MUTATED_SERVICE_TOKEN,
} from '../auth-recovery.constants';
import { AuthRecoveryNotificationService } from './auth-recovery-notification.service';
import { ReferenceAssigneeInterface } from '@concepta/ts-core';

@Injectable()
export class AuthRecoveryService implements AuthRecoveryInterface {
  constructor(
    @Inject(AUTH_RECOVERY_MODULE_SETTINGS_TOKEN)
    private readonly config: AuthRecoverySettingsInterface,
    @Inject(AUTH_RECOVERY_OTP_SERVICE_TOKEN)
    private readonly otpService: OtpServiceInterface,
    private readonly notificationService: AuthRecoveryNotificationService,
    @Inject(AUTH_RECOVERY_USER_LOOKUP_SERVICE_TOKEN)
    private readonly userLookupService: AuthRecoveryUserLookupServiceInterface,
    @Inject(AUTH_RECOVERY_USER_MUTATED_SERVICE_TOKEN)
    private readonly userMutateService: AuthRecoveryUserMutateServiceInterface,
  ) {}

  /**
   * Recover lost username providing an email and send the username by email
   * @param email user email
   * @return {Promise<boolean>} if the recover email was successfully sent
   */
  async recoverLogin(email: string): Promise<boolean> {
    // recover the user by providing an email
    const user = await this.userLookupService.byEmail(email);
    if (!user) {
      // thrown an error if the user is not found
      throw new NotFoundException(`email: ${email} not found`);
    }
    // extract required properties
    const { from } = this.config.email;
    const { subject, fileName } = this.config.email.templates.recoverLogin;
    await this.notificationService.sendMail({
      from,
      subject,
      to: email,
      template: fileName,
      context: {
        login: user.username,
      },
    });

    // email successfully sent
    return true;
  }

  /**
   * Recover lost password providing an email and send the passcode token by email
   * @param email user email
   * @return {Promise<boolean>} if the recover email was successfully sent
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
    const { category, resetTokenExp, assignment, type } = this.config.otp;
    const { from, baseUrl } = this.config.email;
    const { subject, fileName } = this.config.email.templates.recoverPassword;
    // create an OTP save it in the database
    const otpCreateDto = await this.otpService.create(assignment, {
      category,
      type,
      assignee: {
        id,
      },
    });
    const { passcode } = otpCreateDto;
    // email successfully sent or not
    await this.notificationService.sendMail({
      from,
      subject,
      to: email,
      template: fileName,
      context: {
        tokenUrl: `${baseUrl}/${passcode}`,
        tokenExp: resetTokenExp,
      },
    });
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

    // validate passcode return passcode's user if was found
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
   * @return {Promise<boolean>} if the recover email was successfully sent
   */
  async updatePassword(
    passcode: string,
    newPassword: string,
  ): Promise<boolean> {
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

    // email successfully sent
    return true;
  }
}
