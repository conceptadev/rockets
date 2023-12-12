import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import {
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { OtpCreatableInterface, OtpInterface } from '@concepta/ts-common';

import { AuthRecoveryOtpServiceInterface } from '../../interfaces/auth-recovery-otp.service.interface';
import { UserFixture } from '../user/user.fixture';

@Injectable()
export class OtpServiceFixture implements AuthRecoveryOtpServiceInterface {
  async create(
    _assignment: string,
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
    _assignment: string,
    otp: Pick<OtpInterface, 'category' | 'passcode'>,
    _deleteIfValid: boolean,
  ): Promise<ReferenceAssigneeInterface<ReferenceIdInterface<string>> | null> {
    return otp.passcode === 'GOOD_PASSCODE' ? { assignee: UserFixture } : null;
  }

  async clear(
    _assignment: string,
    _otp: Pick<OtpInterface, 'category' | 'assignee'>,
  ): Promise<void> {
    return;
  }
}
