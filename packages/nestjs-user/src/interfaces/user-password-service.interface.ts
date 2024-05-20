import { ReferenceId, ReferenceIdInterface } from '@concepta/ts-core';
import {
  AuthenticatedUserInterface,
  PasswordPlainCurrentInterface,
  PasswordPlainInterface,
} from '@concepta/ts-common';
import {
  PasswordCreationService,
  PasswordStorageInterface,
} from '@concepta/nestjs-password';

export interface UserPasswordServiceInterface {
  /**
   * Get the object containing the password store by user id.
   *
   * Object must have reference id and password storage interface.
   *
   * @param {ReferenceId} userId The id of the user that is being updated
   * @returns {Promise<ReferenceIdInterface & PasswordStorageInterface>} The user being updated
   */
  getPasswordStore: (
    userId: ReferenceId,
  ) => Promise<ReferenceIdInterface & PasswordStorageInterface>;

  /**
   * Set the password (hash) on the user object.
   *
   * @param passwordDto The object containing the password, and optionally the current password.
   * @param userToUpdateId The id of the user being updated.
   * @param authorizedUser The authorized user
   * @returns {ReturnType<PasswordCreationService['createObject']>}
   */
  setPassword: (
    passwordDto: Partial<
      PasswordPlainInterface & PasswordPlainCurrentInterface
    >,
    userToUpdateId?: ReferenceId,
    authorizedUser?: AuthenticatedUserInterface,
  ) => ReturnType<PasswordCreationService['createObject']>;
}
