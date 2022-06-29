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

  async recoverLogin(email: string): Promise<boolean> {
    const user = await this.userLookupService.byEmail(email);
    if (!user) {
      throw new NotFoundException(`email: ${email} not found`);
    }
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

    return true;
  }

  async recoverPassword(email: string): Promise<void> {
    const user = await this.userLookupService.byEmail(email);
    if (!user) {
      throw new NotFoundException(`email: ${email} not found`);
    }
    const { id } = user;
    const { category, resetTokenExp, assignment, type } = this.config.otp;
    const { from, baseUrl } = this.config.email;
    const { subject, fileName } = this.config.email.templates.recoverPassword;
    const otpCreateDto = await this.otpService.create(assignment, {
      category,
      type,
      assignee: {
        id,
      },
    });
    const { passcode } = otpCreateDto;
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

  async validatePasscode(
    passcode: string,
  ): Promise<ReferenceAssigneeInterface | null> {
    const { category, assignment } = this.config.otp;

    return await this.otpService.validate(
      assignment,
      { category, passcode },
      false,
    );
  }

  async updatePassword(
    passcode: string,
    newPassword: string,
  ): Promise<boolean> {
    const otp = await this.validatePasscode(passcode);
    if (!otp) {
      throw new NotFoundException(`passcode not found`);
    }
    await this.userMutateService.update({
      id: otp.assignee.id,
      password: newPassword,
    });

    return true;
  }
}
