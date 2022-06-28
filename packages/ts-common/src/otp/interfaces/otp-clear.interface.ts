import { ReferenceAssignment } from '@concepta/ts-core';
import { OtpInterface } from './otp.interface';

export interface OtpClearInterface {
  /**
   * Clear all otps for assign in given category.
   *
   * @param assignment The assignment of the repository
   * @param otp The otp to clear
   */
  clear(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'assignee' | 'category'>,
  ): Promise<void>;
}
