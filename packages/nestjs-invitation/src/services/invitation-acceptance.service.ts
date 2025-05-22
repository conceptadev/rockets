import { Inject, Logger } from '@nestjs/common';
import {
  AssigneeRelationInterface,
  InvitationInterface,
  LiteralObject,
  RepositoryInterface,
  InjectDynamicRepository,
} from '@concepta/nestjs-common';

import {
  INVITATION_MODULE_EMAIL_SERVICE_TOKEN,
  INVITATION_MODULE_INVITATION_ENTITY_KEY,
  INVITATION_MODULE_OTP_SERVICE_TOKEN,
  INVITATION_MODULE_SETTINGS_TOKEN,
  INVITATION_MODULE_USER_MODEL_SERVICE_TOKEN,
} from '../invitation.constants';

import { InvitationAcceptedEventAsync } from '../events/invitation-accepted.event';
import { InvitationRevocationService } from './invitation-revocation.service';
import { InvitationEntityInterface } from '@concepta/nestjs-common';
import { InvitationSettingsInterface } from '../interfaces/options/invitation-settings.interface';
import { InvitationOtpServiceInterface } from '../interfaces/services/invitation-otp-service.interface';
import { InvitationEmailServiceInterface } from '../interfaces/services/invitation-email-service.interface';
import { InvitationSendMailException } from '../exceptions/invitation-send-mail.exception';
import { InvitationAcceptOptionsInterface } from '../interfaces/options/invitation-accept-options.interface';
import { InvitationException } from '../exceptions/invitation.exception';
import { InvitationNotFoundException } from '../exceptions/invitation-not-found.exception';
import { InvitationUserModelServiceInterface } from '../interfaces/services/invitation-user-model.service.interface';
import { InvitationUserUndefinedException } from '../exceptions/invitation-user-undefined.exception';

export class InvitationAcceptanceService {
  constructor(
    @Inject(INVITATION_MODULE_SETTINGS_TOKEN)
    private readonly settings: InvitationSettingsInterface,
    @InjectDynamicRepository(INVITATION_MODULE_INVITATION_ENTITY_KEY)
    protected readonly invitationRepo: RepositoryInterface<InvitationEntityInterface>,
    @Inject(INVITATION_MODULE_EMAIL_SERVICE_TOKEN)
    private readonly emailService: InvitationEmailServiceInterface,
    @Inject(INVITATION_MODULE_OTP_SERVICE_TOKEN)
    private readonly otpService: InvitationOtpServiceInterface,
    private readonly invitationRevocationService: InvitationRevocationService,
    @Inject(INVITATION_MODULE_USER_MODEL_SERVICE_TOKEN)
    private readonly userModelService: InvitationUserModelServiceInterface,
  ) {}

  /**
   * Activate user's account by providing its OTP passcode and the new password.
   */
  async accept(options: InvitationAcceptOptionsInterface): Promise<boolean> {
    const { code, passcode, payload } = options;

    let invitation: InvitationInterface | null;
    let category: string | undefined = undefined;
    let email: string | undefined = undefined;

    // get the invitation
    try {
      invitation = await this.getOneByCode(code);
    } catch (e: unknown) {
      throw new InvitationException({ originalError: e });
    }

    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    // get the user
    const user = await this.userModelService.byId(invitation.userId);

    if (!user) {
      throw new InvitationUserUndefinedException();
    }

    if (invitation) {
      category = invitation.category;
      email = user.email;
    } else {
      throw new InvitationNotFoundException();
    }

    // get otp by passcode, but no delete it until all workflow pass
    const otp = await this.validatePasscode(passcode, category, true);

    // did we get an otp?
    if (otp) {
      const success = await this.dispatchEvent(invitation, payload);

      if (success) {
        await this.invitationRevocationService.revokeAll({
          email,
          category,
        });

        await this.sendEmail(email);

        return true;
      }
    }

    return false;
  }

  protected async dispatchEvent(
    invitation: InvitationInterface,
    payload?: LiteralObject,
  ): Promise<boolean> {
    const invitationAcceptedEventAsync = new InvitationAcceptedEventAsync({
      invitation,
      data: payload,
    });

    const eventResult = await invitationAcceptedEventAsync.emit();

    return eventResult.every((it) => it === true);
  }

  /**
   * Send the invitation accepted email.
   *
   * @param email - Email
   */
  async sendEmail(email: string): Promise<void> {
    const { from, baseUrl } = this.settings.email;
    const { subject, fileName, logo } =
      this.settings.email.templates.invitationAccepted;

    try {
      await this.emailService.sendMail({
        from,
        subject,
        to: email,
        template: fileName,
        context: {
          logo: `${baseUrl}/${logo}`,
        },
      });
    } catch (e: unknown) {
      throw new InvitationSendMailException(email, {
        originalError: e,
      });
    }
  }

  /**
   * Get one invitation by code.
   *
   * @param code - Pass code string
   */
  async getOneByCode(code: string): Promise<InvitationInterface | null> {
    return this.invitationRepo.findOne({
      where: { code },
    });
  }

  /**
   * Validate passcode and return it's user.
   *
   * @param passcode - User's passcode
   * @param category - Category
   * @param deleteIfValid - Flag to delete if valid or not
   */
  async validatePasscode(
    passcode: string,
    category: string,
    deleteIfValid = false,
  ): Promise<AssigneeRelationInterface | null> {
    try {
      // extract required properties
      const { assignment } = this.settings.otp;

      // validate passcode return passcode's user was found
      return this.otpService.validate(
        assignment,
        { category, passcode },
        deleteIfValid,
      );
    } catch (e) {
      Logger.error(e);
      return null;
    }
  }

  async validate(code: string, passcode: string): Promise<void> {
    let invitation: InvitationInterface | null | undefined;

    try {
      invitation = await this.getOneByCode(code);
    } catch (e) {
      Logger.error(e);
    }

    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    const { category } = invitation;

    const otp = await this.validatePasscode(passcode, category);

    if (!otp) {
      throw new InvitationNotFoundException();
    }
  }
}
