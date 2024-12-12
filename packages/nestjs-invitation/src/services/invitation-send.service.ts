import { Inject } from '@nestjs/common';
import {
  LiteralObject,
  ReferenceEmailInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { EventDispatchService } from '@concepta/nestjs-event';
import { InvitationGetUserEventResponseInterface } from '@concepta/ts-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

import {
  INVITATION_MODULE_EMAIL_SERVICE_TOKEN,
  INVITATION_MODULE_OTP_SERVICE_TOKEN,
  INVITATION_MODULE_SETTINGS_TOKEN,
} from '../invitation.constants';
import { InvitationOtpServiceInterface } from '../interfaces/invitation-otp.service.interface';
import { InvitationSettingsInterface } from '../interfaces/invitation-settings.interface';
import { InvitationEmailServiceInterface } from '../interfaces/invitation-email.service.interface';
import { InvitationSendMailException } from '../exceptions/invitation-send-mail.exception';
import { InvitationGetUserEventAsync } from '../events/invitation-get-user.event';
import { InvitationUserUndefinedException } from '../exceptions/invitation-user-undefined.exception';

export class InvitationSendService {
  constructor(
    @Inject(INVITATION_MODULE_SETTINGS_TOKEN)
    private readonly settings: InvitationSettingsInterface,
    @Inject(INVITATION_MODULE_EMAIL_SERVICE_TOKEN)
    private readonly emailService: InvitationEmailServiceInterface,
    @Inject(INVITATION_MODULE_OTP_SERVICE_TOKEN)
    private readonly otpService: InvitationOtpServiceInterface,
    private readonly eventDispatchService: EventDispatchService,
  ) {}

  async send(
    user: ReferenceIdInterface & ReferenceEmailInterface,
    code: string,
    category: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    const { assignment, type, expiresIn } = this.settings.otp;

    // create an OTP for this invite
    const otp = await this.otpService.create(
      assignment,
      {
        category,
        type,
        expiresIn,
        assignee: {
          id: user.id,
        },
      },
      queryOptions,
    );

    // send the invite email
    await this.sendEmail(user.email, code, otp.passcode, otp.expirationDate);
  }

  async getUser(
    email: string,
    payload?: LiteralObject,
    queryOptions?: QueryOptionsInterface,
  ): Promise<InvitationGetUserEventResponseInterface> {
    const eventResult = await this.eventDispatchService.async(
      new InvitationGetUserEventAsync({
        email,
        data: payload,
        queryOptions,
      }),
    );

    const user = eventResult?.find((it) => it.id && it.email);

    if (!user) {
      throw new InvitationUserUndefinedException();
    }

    return user;
  }

  protected async sendEmail(
    email: string,
    code: string,
    passcode: string,
    resetTokenExp: Date,
  ): Promise<void> {
    const { from, baseUrl } = this.settings.email;
    const { subject, fileName } = this.settings.email.templates.invitation;

    try {
      await this.emailService.sendMail({
        from,
        subject,
        to: email,
        template: fileName,
        context: {
          tokenUrl: `${baseUrl}/?code=${code}&passcode=${passcode}`,
          tokenExp: resetTokenExp,
        },
      });
    } catch (e: unknown) {
      throw new InvitationSendMailException(email, {
        originalError: e,
      });
    }
  }
}
