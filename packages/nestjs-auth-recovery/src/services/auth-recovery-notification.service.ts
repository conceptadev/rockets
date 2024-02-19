import { AuthRecoveryNotificationServiceInterface } from '../interfaces/auth-recovery-notification.service.interface';
import { EmailSendOptionsInterface } from '@concepta/ts-common';
import { Inject, Injectable } from '@nestjs/common';
import {
  AUTH_RECOVERY_MODULE_EMAIL_SERVICE_TOKEN,
  AUTH_RECOVERY_MODULE_SETTINGS_TOKEN,
} from '../auth-recovery.constants';
import { AuthRecoveryEmailServiceInterface } from '../interfaces/auth-recovery-email.service.interface';
import { AuthRecoverySettingsInterface } from '../interfaces/auth-recovery-settings.interface';
import { formatTokenUrl } from '../auth-recovery.utils';

@Injectable()
export class AuthRecoveryNotificationService
  implements AuthRecoveryNotificationServiceInterface
{
  constructor(
    @Inject(AUTH_RECOVERY_MODULE_SETTINGS_TOKEN)
    private readonly settings: AuthRecoverySettingsInterface,
    @Inject(AUTH_RECOVERY_MODULE_EMAIL_SERVICE_TOKEN)
    private readonly emailService: AuthRecoveryEmailServiceInterface,
  ) {}

  async sendEmail(sendMailOptions: EmailSendOptionsInterface): Promise<void> {
    await this.emailService.sendMail(sendMailOptions);
  }

  async sendRecoverPasswordEmail(
    email: string,
    passcode: string,
    resetTokenExp: Date,
  ): Promise<void> {
    const {
      from,
      baseUrl,
      tokenUrlFormatter = formatTokenUrl,
    } = this.settings.email;
    const { subject, fileName } = this.settings.email.templates.recoverPassword;
    await this.sendEmail({
      from,
      subject,
      to: email,
      template: fileName,
      context: {
        tokenUrl: tokenUrlFormatter(baseUrl, passcode),
        tokenExp: resetTokenExp,
      },
    });
  }

  async sendPasswordUpdatedSuccefullyEmail(email: string): Promise<void> {
    const { from } = this.settings.email;
    const { subject, fileName } = this.settings.email.templates.passwordUpdated;
    await this.sendEmail({
      from,
      subject,
      to: email,
      template: fileName,
    });
  }

  async sendRecoverLoginEmail(email: string, username: string): Promise<void> {
    const { from } = this.settings.email;
    const { subject, fileName } = this.settings.email.templates.recoverLogin;
    await this.sendEmail({
      from,
      subject,
      to: email,
      template: fileName,
      context: {
        login: username,
      },
    });
  }
}
