import { InvitationNotificationServiceInterface } from '../interfaces/invitation-notification.service.interface';
import { EmailSendOptionsInterface } from '@concepta/ts-common';
import { Inject, Injectable } from '@nestjs/common';
import {
  INVITATION_EMAIL_SERVICE_TOKEN,
  INVITATION_MODULE_SETTINGS_TOKEN,
} from '../invitation.constants';
import { InvitationEmailServiceInterface } from '../interfaces/invitation-email.service.interface';
import { InvitationSettingsInterface } from '../interfaces/invitation-settings.interface';

@Injectable()
export class InvitationNotificationService
  implements InvitationNotificationServiceInterface
{
  constructor(
    @Inject(INVITATION_EMAIL_SERVICE_TOKEN)
    private readonly emailService: InvitationEmailServiceInterface,
    @Inject(INVITATION_MODULE_SETTINGS_TOKEN)
    private readonly config: InvitationSettingsInterface,
  ) {}

  async sendEmail(sendMailOptions: EmailSendOptionsInterface): Promise<void> {
    await this.emailService.sendMail(sendMailOptions);
  }

  async sendInviteEmail(
    email: string,
    passcode: string,
    resetTokenExp: Date,
  ): Promise<void> {
    const { from, baseUrl } = this.config.email;
    const { subject, fileName } = this.config.email.templates.invitation;
    await this.sendEmail({
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

  async sendInviteAcceptedEmail(email: string): Promise<void> {
    const { from } = this.config.email;
    const { subject, fileName } =
      this.config.email.templates.invitationAccepted;
    await this.sendEmail({
      from,
      subject,
      to: email,
      template: fileName,
    });
  }
}
