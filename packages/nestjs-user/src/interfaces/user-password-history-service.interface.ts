import { PasswordStorageInterface } from '@concepta/nestjs-password';
import { ReferenceId, ReferenceIdInterface } from '@concepta/ts-core';

export interface UserPasswordHistoryServiceInterface {
  /**
   * Get the password history for the user id.
   *
   * Object must have reference id and password storage interface.
   *
   * @param {ReferenceId} userId The id of the user
   * @returns {Promise<(ReferenceIdInterface & PasswordStorageInterface)[]>} The password history for the user
   */
  getHistory: (
    userId: ReferenceId,
  ) => Promise<(ReferenceIdInterface & PasswordStorageInterface)[]>;

  /**
   * Push one password history for the user id.
   *
   * Object must have reference id and password storage interface.
   *
   * @param {ReferenceId} userId The id of the user
   * @param {PasswordStorageInterface} passwordStore One password history for the user
   * @returns {Promise<void>}
   */
  pushHistory: (
    userId: ReferenceId,
    passwordStore: PasswordStorageInterface,
  ) => Promise<void>;
}
