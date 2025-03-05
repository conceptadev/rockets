import { Inject } from '@nestjs/common';
import {
  InvitationInterface,
  ReferenceUsernameInterface,
  ReferenceEmailInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import {
  INVITATION_MODULE_EMAIL_SERVICE_TOKEN,
  INVITATION_MODULE_OTP_SERVICE_TOKEN,
  INVITATION_MODULE_SETTINGS_TOKEN,
  INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  INVITATION_MODULE_USER_MUTATE_SERVICE_TOKEN,
} from '../invitation.constants';
import { InvitationOtpServiceInterface } from '../interfaces/invitation-otp.service.interface';
import { InvitationSettingsInterface } from '../interfaces/invitation-settings.interface';
import { InvitationEmailServiceInterface } from '../interfaces/invitation-email.service.interface';
import { InvitationSendMailException } from '../exceptions/invitation-send-mail.exception';

import { InvitationSendServiceInterface } from '../interfaces/invitation-send-service.interface';
import { InvitationCreateOneInterface } from '../interfaces/invitation-create-one.interface';
import { InvitationMutateService } from './invitation-mutate.service';
import { randomUUID } from 'crypto';
import { InvitationSendInvitationEmailOptionsInterface } from '../interfaces/invitation-send-invitation-email-options.interface';
import { InvitationUserLookupServiceInterface } from '../interfaces/invitation-user-lookup.service.interface';
import { InvitationUserMutateServiceInterface } from '../interfaces/invitation-user-mutate.service.interface';
import { ReferenceIdInterface } from '@concepta/nestjs-common/src';

export class InvitationSendService implements InvitationSendServiceInterface {
  constructor(
    @Inject(INVITATION_MODULE_SETTINGS_TOKEN)
    protected readonly settings: InvitationSettingsInterface,
    @Inject(INVITATION_MODULE_EMAIL_SERVICE_TOKEN)
    protected readonly emailService: InvitationEmailServiceInterface,
    @Inject(INVITATION_MODULE_OTP_SERVICE_TOKEN)
    protected readonly otpService: InvitationOtpServiceInterface,
    @Inject(INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN)
    protected readonly userLookupService: InvitationUserLookupServiceInterface,
    @Inject(INVITATION_MODULE_USER_MUTATE_SERVICE_TOKEN)
    protected readonly userMutateService: InvitationUserMutateServiceInterface,
    protected readonly invitationMutateService: InvitationMutateService,
  ) {}

  /**
   * Creates a new invitation
   *
   * @param createDto - The invitation creation data transfer object containing email and
   *                   optional constraints
   * @param queryOptions - Optional query parameters for the database operation
   * @returns A promise that resolves to the created invitation with id, user, code and
   *          category
   */
  async create(
    createDto: InvitationCreateOneInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<
    Required<Pick<InvitationInterface, 'id' | 'user' | 'code' | 'category'>>
  > {
    const { email } = createDto;
    const user = await this.getUser(
      {
        email,
      },
      queryOptions,
    );

    const invite = await this.invitationMutateService.create(
      {
        ...createDto,
        user: user,
        code: randomUUID(),
      },
      queryOptions,
    );
    return invite;
  }

  async send(
    invitation: Pick<InvitationInterface, 'category' | 'user' | 'code'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    const {
      assignment,
      type,
      expiresIn,
      clearOtpOnCreate,
      rateSeconds,
      rateThreshold,
    } = this.settings.otp;
    const { category, user, code } = invitation;
    // create an OTP for this invite
    const otp = await this.otpService.create({
      assignment,
      otp: {
        category,
        type,
        expiresIn,
        assignee: {
          id: user.id,
        },
      },
      queryOptions,
      clearOnCreate: clearOtpOnCreate,
      rateSeconds,
      rateThreshold,
    });

    // send the invite email
    await this.sendInvitationEmail({
      email: user.email,
      code,
      passcode: otp.passcode,
      resetTokenExp: otp.expirationDate,
    });
  }

  async getUser(
    options: Pick<InvitationInterface, 'email'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<
    ReferenceIdInterface<string> &
      ReferenceUsernameInterface<string> &
      ReferenceEmailInterface<string>
  > {
    const { email } = options;
    let user = await this.userLookupService.byEmail(email, queryOptions);

    if (!user) {
      user = await this.userMutateService.create(
        {
          email,
          username: email,
        },
        queryOptions,
      );
    }

    return user;
  }

  async sendInvitationEmail(
    options: InvitationSendInvitationEmailOptionsInterface,
  ): Promise<void> {
    const { email, code, passcode, resetTokenExp } = options;
    const { from, baseUrl } = this.settings.email;
    const { subject, fileName, logo } =
      this.settings.email.templates.invitation;

    try {
      await this.emailService.sendMail({
        from,
        subject,
        to: email,
        template: fileName,
        context: {
          logo: `${baseUrl}/${logo}`,
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
