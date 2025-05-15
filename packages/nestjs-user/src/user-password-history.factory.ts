import { Factory } from '@concepta/typeorm-seeding';
import { PasswordStorageService } from '@concepta/nestjs-password';
import { UserPasswordHistoryEntityInterface } from '@concepta/nestjs-common';

/**
 * User password history factory
 */
export class UserPasswordHistoryFactory extends Factory<UserPasswordHistoryEntityInterface> {
  private _passwordStorageService = new PasswordStorageService();

  /**
   * Factory callback function.
   */
  protected async entity(
    userPasswordHistory: UserPasswordHistoryEntityInterface,
  ): Promise<UserPasswordHistoryEntityInterface> {
    // generate fake password store
    const passwordStore = await this._passwordStorageService.hash('Test1233');

    userPasswordHistory.passwordHash = passwordStore.passwordHash;
    userPasswordHistory.passwordSalt = passwordStore.passwordSalt;

    // return the new user
    return userPasswordHistory;
  }
}
