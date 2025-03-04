import { Seeder } from '@concepta/typeorm-seeding';
import { UserFactory } from '@concepta/nestjs-user/src/seeding';
import { AuthHistoryFactory } from './auth-history.factory';
import { UserEntityFixture } from './__fixtures__/entities/user-entity.fixture';
/**
 * AuthHistory seeder
 */
export class AuthHistorySeeder extends Seeder {
  /**
   * Runner
   */
  public async run(): Promise<void> {
    // number of authHistorys to create
    const createAmount = process.env?.AUTH_HISTORY_MODULE_SEEDER_AMOUNT
      ? Number(process.env.AUTH_HISTORY_MODULE_SEEDER_AMOUNT)
      : 50;

    this.factory(UserFactory);
    // the factory
    const authHistoryFactory = this.factory(AuthHistoryFactory);

    const userFactory = new UserFactory({
      entity: UserEntityFixture,
    });

    const user = await userFactory.create();

    // create a bunch more
    await authHistoryFactory.createMany(createAmount, {
      user: user,
      userId: user.id,
    });
  }
}
