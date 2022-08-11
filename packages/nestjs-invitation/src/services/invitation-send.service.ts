import { Inject } from '@nestjs/common';

import {
  INVITATION_MODULE_EMAIL_SERVICE_TOKEN,
  INVITATION_MODULE_OTP_SERVICE_TOKEN,
  INVITATION_MODULE_SETTINGS_TOKEN,
  INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  INVITATION_MODULE_USER_MUTATE_SERVICE_TOKEN,
} from '../invitation.constants';

import { InvitationOtpServiceInterface } from '../interfaces/invitation-otp.service.interface';
import { InvitationSettingsInterface } from '../interfaces/invitation-settings.interface';
import { InvitationUserLookupServiceInterface } from '../interfaces/invitation-user-lookup.service.interface';
import { InvitationUserMutateServiceInterface } from '../interfaces/invitation-user-mutate.service.interface';
import {
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/ts-core';
import { InvitationEmailServiceInterface } from '../interfaces/invitation-email.service.interface';

export class InvitationSendService {
  constructor(
    @Inject(INVITATION_MODULE_SETTINGS_TOKEN)
    private readonly settings: InvitationSettingsInterface,
    @Inject(INVITATION_MODULE_EMAIL_SERVICE_TOKEN)
    private readonly emailService: InvitationEmailServiceInterface,
    @Inject(INVITATION_MODULE_OTP_SERVICE_TOKEN)
    private readonly otpService: InvitationOtpServiceInterface,
    @Inject(INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN)
    private readonly userLookupService: InvitationUserLookupServiceInterface,
    @Inject(INVITATION_MODULE_USER_MUTATE_SERVICE_TOKEN)
    private readonly userMutateService: InvitationUserMutateServiceInterface,
  ) {}

  async send(
    userId: string,
    email: string,
    code: string,
    category: string,
  ): Promise<void> {
    const { assignment, type, expiresIn } = this.settings.otp;
    // create an OTP for this invite
    const otp = await this.otpService.create(assignment, {
      category,
      type,
      expiresIn,
      assignee: {
        id: userId,
      },
    });

    // send the invite email
    await this.sendEmail(email, code, otp.passcode, otp.expirationDate);
  }

  async getOrCreateOneUser(
    email: string,
  ): Promise<ReferenceIdInterface & ReferenceUsernameInterface> {
    let user = await this.userLookupService.byEmail(email);

    if (!user) {
      user = await this.userMutateService.create({
        email,
        username: email,
      });
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
  }
}
