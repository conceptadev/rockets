import { Seeder } from '@concepta/typeorm-seeding';
import { PasswordStorageService } from '@concepta/nestjs-password';
import { UserEntityInterface } from '@concepta/nestjs-common';
import { UserFactory } from './user.factory';

/**
 * User seeder
 */
export class UserSeeder extends Seeder {
  /**
   * Reusable password storage service
   */
  private passwordStorageService = new PasswordStorageService();

  /**
   * Runner
   */
  public async run(): Promise<void> {
    // number of users to create
    const createAmount = process.env?.USER_MODULE_SEEDER_AMOUNT
      ? Number(process.env.USER_MODULE_SEEDER_AMOUNT)
      : 50;

    // super admin username
    const superadmin = process.env?.USER_MODULE_SEEDER_SUPERADMIN_USERNAME
      ? process.env?.USER_MODULE_SEEDER_SUPERADMIN_USERNAME
      : 'superadmin';

    // the factory
    const userFactory = this.factory(UserFactory);

    // create a super admin user
    await userFactory
      .map(async (user) => this.setPassword(user))
      .create({
        username: superadmin,
      });

    // create a bunch more
    await userFactory
      .map(async (user) => this.setPassword(user))
      .createMany(createAmount);
  }

  /**
   * Set a password for the given user.
   *
   * @param user - Object implementing the required interface.
   * @param password - The password to set.
   */
  protected async setPassword(
    user: UserEntityInterface,
    password = 'Test1234',
  ) {
    // hash it
    const hashed = await this.passwordStorageService.hash(password);

    // set password and salt
    user.passwordHash = hashed.passwordHash;
    user.passwordSalt = hashed.passwordSalt;
  }
}
