import { Type } from '@nestjs/common';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { PasswordStorageService } from '@concepta/nestjs-password';
import { User } from './entities/user.entity';
import { UserEntityInterface } from './interfaces/user-entity.interface';
import { UserFactory } from './user.factory';

/**
 * User seeder
 */
export class UserSeeder extends Seeder {
  /**
   * The entity class.
   *
   * Override this in a subclass to use a custom entity.
   */
  protected entity: Type<UserEntityInterface> = User;

  /**
   * Reusable password storage service
   */
  private passwordStorageService = new PasswordStorageService();

  /**
   * Runner
   *
   * @param factory Seeder factory
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
    const userFactory = new UserFactory(this.entity);

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
   * @param user Object implementing the required interface.
   * @param password The password to set.
   */
  protected async setPassword(
    user: UserEntityInterface,
    password = 'Test1234',
  ) {
    // encrypt it
    const encrypted = await this.passwordStorageService.encrypt(password);

    // set password and salt
    user.password = encrypted.password;
    user.salt = encrypted.salt;
  }
}
