import { OtpCreateDto } from '../dto/otp-create.dto';
import { OtpAssigneeInterface } from './otp-assignee.interface';
import { OtpCreatableInterface } from './otp-creatable.interface';

export interface OtpServiceInterface {
  /**
   * Create a otp with a for the given assignee.
   * @param context The otp context (same as entity key)
   * @param data The data to create
   * @returns The object created
   */
  create(context: string, data: OtpCreatableInterface): Promise<OtpCreateDto>;

  /**
   * Check if otp is valid
   *
   * @param context The otp context (same as entity key)
   * @param assignee  The assignee to check
   * @param category  The category to check
   * @param passCode The passCode to check
   * @param deleteIfValid If true, delete the otp if it is valid
   * @returns boolean
   */
  iisValid<T extends OtpAssigneeInterface>(
    context: string,
    assignee: Partial<T>,
    category: string,
    passCode: string,
    deleteIfValid: boolean,
  ): Promise<boolean>;

  /**
   * Delete a otp based on params
   * @param context The otp context (same as entity key)
   * @param assignee The assignee to check
   * @param category The category to check
   * @param passCode The passCode to check
   */
  delete<T extends OtpAssigneeInterface>(
    context: string,
    assignee: Partial<T>,
    category: string,
    passCode: string,
  ): Promise<void>;

  /**
   *
   * @param context The context of the repository (same as entity key)
   * @param assignee The assignee to delete
   * @param category The category to delete
   */
  //TODO: should i clear only based on one of the options?
  clear<T extends OtpAssigneeInterface>(
    context: string,
    assignee: Partial<T>,
    category: string,
  ): Promise<void>
}
