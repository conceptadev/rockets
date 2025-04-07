import { AuthVerifyNotificationServiceInterface } from '../interfaces/auth-verify-notification.service.interface';
import { EmailSendOptionsInterface } from '@concepta/nestjs-common';
import { Inject, Injectable } from '@nestjs/common';
import {
  AUTH_VERIFY_MODULE_SETTINGS_TOKEN,
  AuthVerifyEmailService,
} from '../auth-verify.constants';
import { AuthVerifyEmailServiceInterface } from '../interfaces/auth-verify-email.service.interface';
import { AuthVerifySettingsInterface } from '../interfaces/auth-verify-settings.interface';
import { formatTokenUrl } from '../auth-verify.utils';
import { AuthVerifyEmailParamsInterface } from '../interfaces/auth-verify-email-params.interface';

@Injectable()
export class AuthVerifyNotificationService
  implements AuthVerifyNotificationServiceInterface
{
  constructor(
    @Inject(AUTH_VERIFY_MODULE_SETTINGS_TOKEN)
    private readonly settings: AuthVerifySettingsInterface,
    @Inject(AuthVerifyEmailService)
    private readonly emailService: AuthVerifyEmailServiceInterface,
  ) {}

  async sendEmail(sendMailOptions: EmailSendOptionsInterface): Promise<void> {
    await this.emailService.sendMail(sendMailOptions);
  }

  async sendVerifyEmail(params: AuthVerifyEmailParamsInterface): Promise<void> {
    const { email, passcode, resetTokenExp } = params;
    const {
      from,
      baseUrl,
      tokenUrlFormatter = formatTokenUrl,
    } = this.settings.email;
    const { subject, fileName } = this.settings.email.templates.verifyEmail;
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
}
