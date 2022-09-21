import {
  ReferenceAssignment,
  ReferenceQueryOptionsInterface,
} from '@concepta/ts-core';

import { OtpCreatableInterface } from './otp-creatable.interface';
import { OtpInterface } from './otp.interface';

export interface OtpCreateInterface<
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  /**
   * Create a otp with a for the given assignee.
   *
   * @param assignment The otp assignment
   * @param otp The OTP to create
   */
  create(
    assignment: ReferenceAssignment,
    otp: OtpCreatableInterface,
    options?: O,
  ): Promise<OtpInterface>;
}
