import { AuthRecoveryNotificationServiceInterface } from '../interfaces/auth-recovery-notification.service.interface';
import { EmailSendOptionsInterface } from '@concepta/ts-common';
import { Inject, Injectable } from '@nestjs/common';
import { AUTH_RECOVERY_EMAIL_SERVICE_TOKEN } from '../auth-recovery.constants';
import { EmailServiceInterface } from '../interfaces/email-service.interface';

@Injectable()
export class AuthRecoveryNotificationService
  implements AuthRecoveryNotificationServiceInterface
{
  constructor(
    @Inject(AUTH_RECOVERY_EMAIL_SERVICE_TOKEN)
    private readonly emailService: EmailServiceInterface,
  ) {}

  async sendMail(sendMailOptions: EmailSendOptionsInterface): Promise<void> {
    await this.emailService.sendMail(sendMailOptions);
  }
}
