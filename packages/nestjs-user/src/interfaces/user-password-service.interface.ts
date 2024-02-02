import { ReferenceId, ReferenceIdInterface } from '@concepta/ts-core';
import {
  PasswordPlainCurrentInterface,
  PasswordPlainInterface,
} from '@concepta/ts-common';
import {
  PasswordCreationService,
  PasswordStorageInterface,
} from '@concepta/nestjs-password';

export interface UserPasswordServiceInterface {
  /**
   * Should return true if the user can update their password.
   *
   * @param {ReferenceIdInterface} userToUpdate The user that is being updated
   * @param {ReferenceIdInterface} authenticatedUser The user that is currently authenticated
   * @returns {Promise<boolean>} true if user can update password
   */
  canUpdate: (
    userToUpdate: ReferenceIdInterface,
    authenticatedUser: ReferenceIdInterface,
  ) => Promise<boolean>;

  /**
   * Get the user being updated by id.
   *
   * Object must have reference id and password storage interface.
   *
   * @param {ReferenceId} userId The id of the user that is being updated
   * @returns {Promise<ReferenceIdInterface & PasswordStorageInterface>} The user being updated
   */
  getUserById: (
    userId: ReferenceId,
  ) => Promise<ReferenceIdInterface & PasswordStorageInterface>;

  /**
   * Set the password (hash) on the user object.
   *
   * @param passwordDto The object containing the password, and optionally the current password.
   * @param userId The id of the user being updated.
   * @returns {ReturnType<PasswordCreationService['createObject']>}
   */
  setPassword: (
    passwordDto: Partial<
      PasswordPlainInterface & PasswordPlainCurrentInterface
    >,
    userId?: ReferenceId,
  ) => ReturnType<PasswordCreationService['createObject']>;
}
