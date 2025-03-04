import { Inject } from '@nestjs/common';
import {
  InvitationInterface,
  InvitationGetUserEventResponseInterface,
} from '@concepta/nestjs-common';
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

import { InvitationSendServiceInterface } from '../interfaces/invitation-send-service.interface';
import { InvitationCreateOneInterface } from '../interfaces/invitation-create-one.interface';
import { InvitationMutateService } from './invitation-mutate.service';
import { randomUUID } from 'crypto';

export class InvitationSendService implements InvitationSendServiceInterface {
  constructor(
    @Inject(INVITATION_MODULE_SETTINGS_TOKEN)
    protected readonly settings: InvitationSettingsInterface,
    @Inject(INVITATION_MODULE_EMAIL_SERVICE_TOKEN)
    protected readonly emailService: InvitationEmailServiceInterface,
    @Inject(INVITATION_MODULE_OTP_SERVICE_TOKEN)
    protected readonly otpService: InvitationOtpServiceInterface,
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
    const { email, constraints } = createDto;
    const user = await this.getUser(
      {
        email,
        constraints,
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
    await this.sendEmail(user.email, code, otp.passcode, otp.expirationDate);
  }

  async getUser(
    options: Pick<InvitationInterface, 'email'> &
      Partial<Pick<InvitationInterface, 'constraints'>>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<InvitationGetUserEventResponseInterface> {
    const { email, constraints } = options;
    const getUserEvent = new InvitationGetUserEventAsync({
      email,
      data: constraints,
      queryOptions,
    });

    const eventResult = await getUserEvent.emit();

    const user = eventResult?.find((it) => it.id && it.email);

    if (!user) {
      throw new InvitationUserUndefinedException();
    }

    return user;
  }

  async sendEmail(
    email: string,
    code: string,
    passcode: string,
    resetTokenExp: Date,
  ): Promise<void> {
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
