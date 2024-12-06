import { PasswordStorageInterface } from '@concepta/nestjs-password';
import { ReferenceId, ReferenceIdInterface } from '@concepta/nestjs-common';

export interface UserPasswordHistoryServiceInterface {
  /**
   * Get the password history for the user id.
   *
   * Object must have reference id and password storage interface.
   *
   * @param userId - The id of the user
   * @returns The password history for the user
   */
  getHistory: (
    userId: ReferenceId,
  ) => Promise<(ReferenceIdInterface & PasswordStorageInterface)[]>;

  /**
   * Push one password history for the user id.
   *
   * Object must have reference id and password storage interface.
   *
   * @param userId - The id of the user
   * @param passwordStore - One password history for the user
   */
  pushHistory: (
    userId: ReferenceId,
    passwordStore: PasswordStorageInterface,
  ) => Promise<void>;
}
