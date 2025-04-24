import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import {
  AssigneeRelationInterface,
  OtpCreateParamsInterface,
} from '@concepta/nestjs-common';
import { OtpInterface } from '@concepta/nestjs-common';

import { AuthRecoveryOtpServiceInterface } from '../../interfaces/auth-recovery-otp.service.interface';
import { UserFixture } from '../user/user.fixture';

@Injectable()
export class OtpServiceFixture implements AuthRecoveryOtpServiceInterface {
  async create({ otp }: OtpCreateParamsInterface): Promise<OtpInterface> {
    const { assigneeId, category, type } = otp;
    return {
      id: randomUUID(),
      category,
      type,
      assigneeId,
      active: true,
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
  ): Promise<AssigneeRelationInterface | null> {
    return otp.passcode === 'GOOD_PASSCODE'
      ? { assigneeId: UserFixture.id }
      : null;
  }

  async clear(
    _assignment: string,
    _otp: Pick<OtpInterface, 'category' | 'assigneeId'>,
  ): Promise<void> {
    return;
  }
}
