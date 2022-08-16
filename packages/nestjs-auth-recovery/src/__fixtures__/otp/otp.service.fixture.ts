import { Injectable } from '@nestjs/common';
import {
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { OtpCreatableInterface, OtpInterface } from '@concepta/ts-common';

import { AuthRecoveryOtpServiceInterface } from '../../interfaces/auth-recovery-otp.service.interface';

@Injectable()
export class OtpServiceFixture implements AuthRecoveryOtpServiceInterface {
  create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    assignment: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    otp: OtpCreatableInterface,
  ): Promise<OtpInterface> {
    throw new Error('Method not implemented.');
  }
  validate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    assignment: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    otp: Pick<OtpInterface, 'category' | 'passcode'>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteIfValid: boolean,
  ): Promise<ReferenceAssigneeInterface<ReferenceIdInterface<string>> | null> {
    throw new Error('Method not implemented.');
  }
  clear(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    assignment: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    otp: Pick<OtpInterface, 'category' | 'assignee'>,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
