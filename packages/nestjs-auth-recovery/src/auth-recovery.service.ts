import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AuthRecoveryInterface } from './interfaces/auth-recovery.interface';
import { AuthRecoverySettingsInterface } from './interfaces/auth-recovery-settings.interface';
import { OtpServiceInterface } from './interfaces/otp-service.interface';
import { EmailServiceInterface } from './interfaces/email-service.interface';
import { AuthRecoveryUserLookupServiceInterface } from './interfaces/auth-recovery-user-lookup-service.interface';
import { AuthRecoveryUserMutateServiceInterface } from './interfaces/auth-recovery-user-mutate-service.interface';
import {
  AUTH_RECOVERY_EMAIL_SERVICE_TOKEN,
  AUTH_RECOVERY_MODULE_SETTINGS_TOKEN,
  AUTH_RECOVERY_OTP_SERVICE_TOKEN,
  AUTH_RECOVERY_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_RECOVERY_USER_MUTATED_SERVICE_TOKEN,
} from './auth-recovery.constants';

@Injectable()
export class AuthRecoveryService implements AuthRecoveryInterface {
  constructor(
    @Inject(AUTH_RECOVERY_MODULE_SETTINGS_TOKEN)
    private readonly config: AuthRecoverySettingsInterface,
    @Inject(AUTH_RECOVERY_OTP_SERVICE_TOKEN)
    private readonly otpService: OtpServiceInterface,
    @Inject(AUTH_RECOVERY_EMAIL_SERVICE_TOKEN)
    private readonly emailService: EmailServiceInterface,
    @Inject(AUTH_RECOVERY_USER_LOOKUP_SERVICE_TOKEN)
    private readonly userLookupService: AuthRecoveryUserLookupServiceInterface,
    @Inject(AUTH_RECOVERY_USER_MUTATED_SERVICE_TOKEN)
    private readonly userMutateService: AuthRecoveryUserMutateServiceInterface,
  ) {}

  async recoverLogin(email: string): Promise<boolean> {
    throw new Error(`Method not implemented, cant get ${email}.`);
    // await this.userLookupService.byEmail(email);
    // await this.emailService.send() // recover login template
  }

  async recoverPassword(email: string): Promise<void> {
    const user = await this.userLookupService.byEmail(email);
    if (!user) {
      throw new NotFoundException(`email: ${email} not found`);
    }
    const otpCreateDto = await this.otpService.create(
      this.config.otp.assignment,
      {
        category: this.config.otp.category,
        type: this.config.otp.type,
        assignee: {
          id: user.id,
        },
      },
    );
    await this.emailService.sendMail({
      to: email,
      from: this.config.email.from, // duplicated? It is already in email module already has that
      subject: this.config.email.recoverPasswordEmailSubject,
      template: this.config.email.recoverPasswordTemplate,
      context: {
        tokenUrl: `${this.config.email.baseUrl}/${otpCreateDto.passcode}`,
        tokenExp: this.config.otp.resetTokenExp,
      },
    });
  }

  async validatePasscode(passcode: string): Promise<boolean> {
    throw new Error(`Method not implemented, cant get ${passcode}.`);
    // await this.otpService.validate(a, b, c, passcode);
  }

  async updatePassword(
    passcode: string,
    newPassword: string,
  ): Promise<boolean> {
    throw new Error(
      `Method not implemented, cant get ${passcode} ${newPassword}.`,
    );
    // await this.otpService.validate(a, b, c, passcode, true) => user;
    // await this.userMutateService.update({id: userId, newPassword});
    // await this.emailService.send() // success template
  }
}
