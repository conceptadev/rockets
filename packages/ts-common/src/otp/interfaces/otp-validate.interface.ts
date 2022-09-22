import {
  ReferenceAssigneeInterface,
  ReferenceAssignment,
  ReferenceQueryOptionsInterface,
} from '@concepta/ts-core';
import { OtpInterface } from './otp.interface';

export interface OtpValidateInterface<
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  /**
   * Check if otp is valid
   *
   * @param assignment The otp assignment
   * @param otp The otp to validate
   * @param deleteIfValid If true, delete the otp if it is valid
   */
  validate(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'category' | 'passcode'>,
    deleteIfValid: boolean,
    options?: O,
  ): Promise<ReferenceAssigneeInterface | null>;
}
