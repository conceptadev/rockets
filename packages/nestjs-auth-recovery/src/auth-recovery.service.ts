import { Inject, Injectable } from '@nestjs/common';

import { AuthRecoveryInterface } from './interfaces/auth-recovery.interface';
import { AuthRecoverySettingsInterface } from './interfaces/auth-recovery-settings.interface';
import { OtpServiceInterface } from './interfaces/otp-service.interface';
import { EmailMailerServiceInterface } from './interfaces/email-mailer-service.interface';
import { UserLookupServiceInterface } from './interfaces/user-lookup-service.interface';
import { UserMutateServiceInterface } from './interfaces/user-mutate-service.interface';
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
    private readonly emailService: EmailMailerServiceInterface,
    @Inject(AUTH_RECOVERY_USER_LOOKUP_SERVICE_TOKEN)
    private readonly userLookupService: UserLookupServiceInterface,
    @Inject(AUTH_RECOVERY_USER_MUTATED_SERVICE_TOKEN)
    private readonly userMutateService: UserMutateServiceInterface,
  ) {}

  async recoverLogin(email: string): Promise<boolean> {
    throw new Error('Method not implemented.');
    // await this.userLookupService.byEmail(email);
    // await this.emailService.send() // recover login template
  }
  async recoverPassword(email: string): Promise<boolean> {
    throw new Error('Method not implemented.');
    // await this.userLookupService.byEmail(email);
    // await this.otpService.createPasscode(a, b, c, passcode);
    // await this.emailService.send() // recover password template with URL/passcode;
  }
  async validatePasscode(passcode: string): Promise<boolean> {
    throw new Error('Method not implemented.');
    // await this.otpService.validate(a, b, c, passcode);
  }
  async updatePassword(
    passcode: string,
    newPassword: string,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
    // await this.otpService.validate(a, b, c, passcode, true) => user;
    // await this.userMutateService.update({id: userId, newPassword});
    // await this.emailService.send() // success template
  }
}
