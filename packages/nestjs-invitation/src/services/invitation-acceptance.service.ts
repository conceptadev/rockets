import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { LiteralObject, ReferenceAssigneeInterface } from '@concepta/ts-core';
import { InvitationInterface } from '@concepta/ts-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { EventDispatchService } from '@concepta/nestjs-event';
import { BaseService, QueryOptionsInterface } from '@concepta/typeorm-common';

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
import { InvitationSendMailException } from '../exceptions/invitation-send-mail.exception';

export class InvitationAcceptanceService extends BaseService<InvitationEntityInterface> {
  constructor(
    @Inject(INVITATION_MODULE_SETTINGS_TOKEN)
    private readonly settings: InvitationSettingsInterface,
    @InjectDynamicRepository(INVITATION_MODULE_INVITATION_ENTITY_KEY)
    invitationRepo: Repository<InvitationEntityInterface>,
    @Inject(INVITATION_MODULE_EMAIL_SERVICE_TOKEN)
    private readonly emailService: InvitationEmailServiceInterface,
    @Inject(INVITATION_MODULE_OTP_SERVICE_TOKEN)
    private readonly otpService: InvitationOtpServiceInterface,
    private readonly eventDispatchService: EventDispatchService,
    private readonly invitationRevocationService: InvitationRevocationService,
  ) {
    super(invitationRepo);
  }

  /**
   * Activate user's account by providing its OTP passcode and the new password.
   */
  async accept(
    invitationDto: InvitationDto,
    passcode: string,
    payload?: LiteralObject,
    queryOptions?: QueryOptionsInterface,
  ): Promise<boolean> {
    const { category, email } = invitationDto;

    // run in transaction
    const result = await this.transaction(queryOptions).commit(
      async (transaction): Promise<boolean> => {
        // override the query options
        const nestedQueryOptions = { ...queryOptions, transaction };

        // get otp by passcode, but no delete it until all workflow pass
        const otp = await this.validatePasscode(
          passcode,
          category,
          true,
          nestedQueryOptions,
        );

        // did we get an otp?
        if (otp) {
          const success = await this.dispatchEvent(
            invitationDto,
            { ...payload, userId: invitationDto.user.id },
            nestedQueryOptions,
          );

          if (success) {
            await this.invitationRevocationService.revokeAll(
              email,
              category,
              nestedQueryOptions,
            );

            return true;
          }
        }

        return false;
      },
    );

    if (result) {
      await this.sendEmail(email);
      return true;
    }

    return false;
  }

  protected async dispatchEvent(
    invitationDto: InvitationDto,
    payload?: LiteralObject,
    queryOptions?: QueryOptionsInterface,
  ): Promise<boolean> {
    const invitationAcceptedEventAsync = new InvitationAcceptedEventAsync({
      invitation: invitationDto,
      data: payload,
      queryOptions,
    });

    const eventResult = await this.eventDispatchService.async(
      invitationAcceptedEventAsync,
    );

    return eventResult.every((it) => it === true);
  }

  /**
   * Send the invitation accepted email.
   *
   * @param email - Email
   */
  async sendEmail(email: string): Promise<void> {
    const { from } = this.settings.email;
    const { subject, fileName } =
      this.settings.email.templates.invitationAccepted;

    try {
      await this.emailService.sendMail({
        from,
        subject,
        to: email,
        template: fileName,
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
   * @param queryOptions - Query options
   */
  async getOneByCode(
    code: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<InvitationInterface | null> {
    return this.findOne({ where: { code }, relations: ['user'] }, queryOptions);
  }

  /**
   * Validate passcode and return it's user.
   *
   * @param passcode - User's passcode
   * @param category - Category
   * @param deleteIfValid - Flag to delete if valid or not
   * @param queryOptions - Query Options
   */
  async validatePasscode(
    passcode: string,
    category: string,
    deleteIfValid = false,
    queryOptions?: QueryOptionsInterface,
  ): Promise<ReferenceAssigneeInterface | null> {
    // extract required properties
    const { assignment } = this.settings.otp;

    // validate passcode return passcode's user was found
    return this.otpService.validate(
      assignment,
      { category, passcode },
      deleteIfValid,
      queryOptions,
    );
  }
}
