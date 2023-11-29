import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import {
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { OtpCreatableInterface, OtpInterface } from '@concepta/ts-common';

import { InvitationOtpServiceInterface } from '../../interfaces/invitation-otp.service.interface';

import { UserFixture } from '../user/user.fixture';

@Injectable()
export class OtpServiceFixture implements InvitationOtpServiceInterface {
  async create(
    assignment: string, // eslint-disable-line @typescript-eslint/no-unused-vars
    otp: OtpCreatableInterface,
  ): Promise<OtpInterface> {
    const { assignee, category, type } = otp;
    return {
      id: randomUUID(),
      category,
      type,
      assignee,
      passcode: 'GOOD_PASSCODE',
      expirationDate: new Date(),
      dateCreated: new Date(),
      dateUpdated: new Date(),
      dateDeleted: null,
      version: 1,
    };
  }

  async validate(
    assignment: string, // eslint-disable-line @typescript-eslint/no-unused-vars
    otp: Pick<OtpInterface, 'category' | 'passcode'>,
    deleteIfValid: boolean, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<ReferenceAssigneeInterface<ReferenceIdInterface<string>> | null> {
    return otp.passcode === 'GOOD_PASSCODE' ? { assignee: UserFixture } : null;
  }

  async clear(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    assignment: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    otp: Pick<OtpInterface, 'category' | 'assignee'>,
  ): Promise<void> {
    return;
  }
}
