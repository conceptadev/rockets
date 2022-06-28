import { ReferenceAssignment } from '@concepta/ts-core';
import { OtpInterface } from './otp.interface';

export interface OtpValidateInterface {
  /**
   * Check if otp is valid
   *
   * @param assignment The otp assignment
   * @param otp The otp to validate
   * @param deleteIfValid If true, delete the otp if it is valid
   */
  validate(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'assignee' | 'category' | 'passcode'>,
    deleteIfValid: boolean,
  ): Promise<boolean>;
}
