import { OtpCreateDto } from '../dto/otp-create.dto';
import { OtpAssigneeInterface } from './otp-assignee.interface';
import { OtpCreatableInterface } from './otp-creatable.interface';

export interface OtpServiceInterface {
  /**
   * Create a otp with a for the given assignee.
   *
   * @param assignment The otp assignment
   * @param data The data to create
   * @returns The object created
   */
  create(
    assignment: string,
    data: OtpCreatableInterface,
  ): Promise<OtpCreateDto>;

  /**
   * Check if otp is valid
   *
   * @param assignment The otp assignment
   * @param assignee  The assignee to check
   * @param category  The category to check
   * @param passcode The passcode to check
   * @param deleteIfValid If true, delete the otp if it is valid
   * @returns boolean
   */
  iisValid<T extends OtpAssigneeInterface>(
    assignment: string,
    assignee: Partial<T>,
    category: string,
    passcode: string,
    deleteIfValid: boolean,
  ): Promise<boolean>;

  /**
   * Delete a otp based on params.
   *
   * @param assignment The otp assignment
   * @param assignee The assignee to check
   * @param category The category to check
   * @param passcode The passcode to check
   */
  delete<T extends OtpAssigneeInterface>(
    assignment: string,
    assignee: Partial<T>,
    category: string,
    passcode: string,
  ): Promise<void>;

  /**
   * Clear all assignee otps based for given category.
   *
   * @param assignment The assignment of the repository
   * @param assignee The assignee to delete
   * @param category The category to delete
   */
  //TODO: should i clear only based on one of the options?
  clear<T extends OtpAssigneeInterface>(
    assignment: string,
    assignee: Partial<T>,
    category: string,
  ): Promise<void>;
}
