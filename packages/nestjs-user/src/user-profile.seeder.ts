import { Seeder } from '@concepta/typeorm-seeding';
import { UserProfileFactory } from './user-profile.factory';

/**
 * User Profile seeder
 */
export class UserProfileSeeder extends Seeder {
  /**
   * Runner
   */
  public async run(): Promise<void> {
    // number of users to create
    const createAmount = process.env?.USER_MODULE_SEEDER_AMOUNT
      ? Number(process.env.USER_MODULE_SEEDER_AMOUNT)
      : 50;

    // the factory
    const userProfileFactory = this.factory(UserProfileFactory);

    // create a bunch
    await userProfileFactory.createMany(createAmount);
  }
}
