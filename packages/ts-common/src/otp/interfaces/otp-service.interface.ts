import { ReferenceAssignment } from '@concepta/ts-core';
import { OtpCreatableInterface } from './otp-creatable.interface';
import { OtpInterface } from './otp.interface';

export interface OtpServiceInterface {
  /**
   * Create a otp with a for the given assignee.
   *
   * @param assignment The otp assignment
   * @param otp The OTP to create
   */
  create(
    assignment: ReferenceAssignment,
    otp: OtpCreatableInterface,
  ): Promise<OtpInterface>;

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

  /**
   * Delete a otp based on params
   * @param assignment The otp assignment
   * @param otp The otp to delete
   */
  delete(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'assignee' | 'category' | 'passcode'>,
  ): Promise<void>;

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
