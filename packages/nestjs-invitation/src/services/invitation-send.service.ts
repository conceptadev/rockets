import { randomUUID } from 'crypto';
import { Inject } from '@nestjs/common';
import {
  InvitationInterface,
  InvitationUserInterface,
} from '@concepta/nestjs-common';
import {
  INVITATION_MODULE_EMAIL_SERVICE_TOKEN,
  INVITATION_MODULE_OTP_SERVICE_TOKEN,
  INVITATION_MODULE_SETTINGS_TOKEN,
  INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  INVITATION_MODULE_USER_MUTATE_SERVICE_TOKEN,
} from '../invitation.constants';
import { InvitationOtpServiceInterface } from '../interfaces/services/invitation-otp-service.interface';
import { InvitationSettingsInterface } from '../interfaces/options/invitation-settings.interface';
import { InvitationEmailServiceInterface } from '../interfaces/services/invitation-email-service.interface';
import { InvitationSendMailException } from '../exceptions/invitation-send-mail.exception';

import { InvitationSendServiceInterface } from '../interfaces/services/invitation-send-service.interface';
import { InvitationCreateInviteInterface } from '../interfaces/domain/invitation-create-invite.interface';
import { InvitationLookupService } from './invitation-lookup.service';
import { InvitationMutateService } from './invitation-mutate.service';
import { InvitationSendInvitationEmailOptionsInterface } from '../interfaces/options/invitation-send-invitation-email-options.interface';
import { InvitationUserLookupServiceInterface } from '../interfaces/services/invitation-user-lookup.service.interface';
import { InvitationUserMutateServiceInterface } from '../interfaces/services/invitation-user-mutate.service.interface';
import { InvitationSendInviteInterface } from '../interfaces/domain/invitation-send-invite.interface';
import { InvitationNotFoundException } from '../exceptions/invitation-not-found.exception';
import { InvitationUserUndefinedException } from '../exceptions/invitation-user-undefined.exception';

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
    protected readonly invitationLookupService: InvitationLookupService,
    protected readonly invitationMutateService: InvitationMutateService,
  ) {}

  /**
   * Creates a new invitation
   *
   * @param createInviteDto - The invitation creation data transfer object containing email and
   *                   optional constraints
   * @returns A promise that resolves to the created invitation with id, user, code and
   *          category
   */
  async create(
    createInviteDto: InvitationCreateInviteInterface,
  ): Promise<InvitationSendInviteInterface> {
    const { email } = createInviteDto;
    const user = await this.getUser({
      email,
    });

    const invite = await this.invitationMutateService.create({
      ...createInviteDto,
      userId: user.id,
      code: randomUUID(),
    });

    return invite;
  }

  async send(
    invitation: Pick<InvitationInterface, 'id'> | InvitationSendInviteInterface,
  ): Promise<void> {
    const {
      assignment,
      type,
      expiresIn,
      clearOtpOnCreate,
      rateSeconds,
      rateThreshold,
    } = this.settings.otp;

    let theInvitation: InvitationSendInviteInterface | null;

    if (invitation && 'category' in invitation) {
      theInvitation = invitation;
    } else {
      theInvitation = await this.invitationLookupService.byId(invitation.id);
    }

    if (!theInvitation) {
      throw new InvitationNotFoundException();
    }

    const { category, userId, code } = theInvitation;

    // create an OTP for this invite
    const otp = await this.otpService.create({
      assignment,
      otp: {
        category,
        type,
        expiresIn,
        assigneeId: userId,
      },
      clearOnCreate: clearOtpOnCreate,
      rateSeconds,
      rateThreshold,
    });

    // lookup the user
    const user = await this.userLookupService.byId(userId);

    if (!user) {
      throw new InvitationUserUndefinedException();
    }

    // send the invite email
    await this.sendInvitationEmail({
      email: user.email,
      code,
      passcode: otp.passcode,
      resetTokenExp: otp.expirationDate,
    });
  }

  async getUser(
    options: Pick<InvitationCreateInviteInterface, 'email' | 'constraints'>,
  ): Promise<InvitationUserInterface> {
    const { email } = options;
    let user = await this.userLookupService.byEmail(email);

    if (!user) {
      user = await this.userMutateService.create({
        email,
        username: email,
      });
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
