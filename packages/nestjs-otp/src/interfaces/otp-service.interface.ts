import { ReferenceAssignment, ReferenceIdInterface } from '@concepta/ts-core';
import { OtpCreatableInterface } from './otp-creatable.interface';
import { OtpInterface } from './otp.interface';

export interface OtpServiceInterface {
  /**
   * Create a otp with a for the given assignee.
   *
   * @param assignment The otp assignment
   * @param data The data to create
   */
  create(
    assignment: ReferenceAssignment,
    data: OtpCreatableInterface,
  ): Promise<OtpInterface>;

  /**
   * Check if otp is valid
   *
   * @param assignment The otp assignment
   * @param assignee  The assignee to check
   * @param category  The category to check
   * @param passcode The passcode to check
   * @param deleteIfValid If true, delete the otp if it is valid
   */
  isValid(
    assignment: ReferenceAssignment,
    assignee: ReferenceIdInterface,
    category: string,
    passcode: string,
    deleteIfValid: boolean,
  ): Promise<boolean>;

  /**
   * Delete a otp based on params
   * @param assignment The otp assignment
   * @param assignee The assignee to check
   * @param category The category to check
   * @param passcode The passcode to check
   */
  delete(
    assignment: ReferenceAssignment,
    assignee: ReferenceIdInterface,
    category: string,
    passcode: string,
  ): Promise<void>;

  /**
   * Clear all otps for assign in given category.
   *
   * @param assignment The assignment of the repository
   * @param assignee The assignee to delete
   * @param category The category to delete
   */
  clear(
    assignment: ReferenceAssignment,
    assignee: ReferenceIdInterface,
    category: string,
  ): Promise<void>;
}
