import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { LiteralObject, ReferenceAssigneeInterface } from '@concepta/ts-core';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { EventDispatchService } from '@concepta/nestjs-event';

import {
  INVITATION_MODULE_EMAIL_SERVICE_TOKEN,
  INVITATION_MODULE_INVITATION_ENTITY_KEY,
  INVITATION_MODULE_OTP_SERVICE_TOKEN,
  INVITATION_MODULE_SETTINGS_TOKEN,
} from '../invitation.constants';

import { InvitationDto } from '../dto/invitation.dto';
import { InvitationAcceptedEventAsync } from '../events/invitation-accepted.event';
import { InvitationRevocationService } from './invitation-revocation.service';
import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';
import { InvitationSettingsInterface } from '../interfaces/invitation-settings.interface';
import { InvitationOtpServiceInterface } from '../interfaces/invitation-otp.service.interface';
import { InvitationEmailServiceInterface } from '../interfaces/invitation-email.service.interface';

export class InvitationAcceptanceService {
  constructor(
    @InjectDynamicRepository(INVITATION_MODULE_INVITATION_ENTITY_KEY)
    private invitationRepo: Repository<InvitationEntityInterface>,
    @Inject(INVITATION_MODULE_SETTINGS_TOKEN)
    private readonly settings: InvitationSettingsInterface,
    @Inject(INVITATION_MODULE_EMAIL_SERVICE_TOKEN)
    private readonly emailService: InvitationEmailServiceInterface,
    @Inject(INVITATION_MODULE_OTP_SERVICE_TOKEN)
    private readonly otpService: InvitationOtpServiceInterface,
    private readonly eventDispatchService: EventDispatchService,
    private readonly invitationRevocationService: InvitationRevocationService,
  ) {}

  /**
   * Activate user's account by providing its OTP passcode and the new password.
   *
   */
  async accept(
    invitationDto: InvitationDto,
    passcode: string,
    payload?: LiteralObject,
  ): Promise<boolean> {
    const { category, email } = invitationDto;
    // get otp by passcode, but no delete it until all workflow pass
    const otp = await this.validatePasscode(passcode, category, true);

    // did we get an otp?
    if (otp) {
      const success = await this.dispatchEvent(invitationDto, payload);

      if (!success) {
        return false;
      }

      await this.sendEmail(email);

      await this.invitationRevocationService.revokeAll(email, category);

      return true;
    }

    return false;
  }

  protected async dispatchEvent(
    invitationDto: InvitationDto,
    payload?: LiteralObject,
  ): Promise<boolean> {
    const invitationAcceptedEventAsync = new InvitationAcceptedEventAsync({
      ...invitationDto,
      data: payload,
    });

    const eventResult = await this.eventDispatchService.async(
      invitationAcceptedEventAsync,
    );

    return eventResult.some((it) => it === true);
  }

  async sendEmail(email: string): Promise<void> {
    const { from } = this.settings.email;
    const { subject, fileName } =
      this.settings.email.templates.invitationAccepted;

    await this.emailService.sendMail({
      from,
      subject,
      to: email,
      template: fileName,
    });
  }

  /**
   * Get one invitation by code.
   *
   * @param code
   */
  async getOneByCode(code: string): Promise<InvitationDto | null> {
    return this.invitationRepo.findOneBy({ code });
  }

  /**
   * Validate passcode and return it's user.
   *
   * @param passcode user's passcode
   * @param category
   * @param deleteIfValid flag to delete if valid or not
   */
  async validatePasscode(
    passcode: string,
    category: string,
    deleteIfValid = false,
  ): Promise<ReferenceAssigneeInterface | null> {
    // extract required properties
    const { assignment } = this.settings.otp;

    // validate passcode return passcode's user was found
    return this.otpService.validate(
      assignment,
      { category, passcode },
      deleteIfValid,
    );
  }
}
