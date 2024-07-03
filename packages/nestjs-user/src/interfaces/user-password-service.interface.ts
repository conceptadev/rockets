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
   * Get the user being updated by id.
   *
   * Object must have reference id and password storage interface.
   * @param userId - The id of the user that is being updated
   * @returns The user being updated
   */
  getUserById: (
    userId: ReferenceId,
  ) => Promise<ReferenceIdInterface & PasswordStorageInterface>;

  /**
   * Set the password (hash) on the user object.
   * @param passwordDto - The object containing the password, and optionally the current password.
   * @param userToUpdateId - The id of the user being updated.
   * @param authorizedUser - The authorized user
   */
  setPassword: (
    passwordDto: Partial<
      PasswordPlainInterface & PasswordPlainCurrentInterface
    >,
    userToUpdateId?: ReferenceId,
    authorizedUser?: AuthenticatedUserInterface,
  ) => ReturnType<PasswordCreationService['createObject']>;
}
