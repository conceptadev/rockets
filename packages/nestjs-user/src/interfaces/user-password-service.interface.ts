import {
  ReferenceId,
  ReferenceIdInterface,
  AuthenticatedUserInterface,
  PasswordPlainCurrentInterface,
  PasswordPlainInterface,
  PasswordStorageInterface,
} from '@concepta/nestjs-common';

export interface UserPasswordServiceInterface {
  /**
   * Get the object containing the password store by user id.
   *
   * Object must have reference id and password storage interface.
   *
   * @param userId - The id of the user that is being updated
   * @returns The user being updated
   */
  getPasswordStore: (
    userId: ReferenceId,
  ) => Promise<ReferenceIdInterface & PasswordStorageInterface>;

  /**
   * Set the password and save in database.
   *
   * @param passwordDto - The object containing the password, and optionally the current password.
   * @param userToUpdateId - The id of the user being updated.
   * @param authorizedUser - The authorized user
   */
  setPassword: (
    passwordDto: PasswordPlainInterface &
      Partial<PasswordPlainCurrentInterface>,
    userToUpdateId?: ReferenceId,
    authorizedUser?: AuthenticatedUserInterface,
  ) => Promise<void>;
}
