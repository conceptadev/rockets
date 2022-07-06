import Faker from '@faker-js/faker';
import { Factory } from '@jorgebodega/typeorm-seeding';
import { UserEntityInterface } from '@concepta/nestjs-user';
import { AuthRecoveryUserEntityFixture } from '../auth-recovery-user-entity.fixture';

export class UserFactoryFixture extends Factory<UserEntityInterface> {
  usedUsernames: Record<string, boolean> = {};

  protected async definition(): Promise<UserEntityInterface> {
    const user = new AuthRecoveryUserEntityFixture();

    // set the username
    user.username = this.generateUniqueUsername();

    // fake email address
    user.email = Faker.internet.email();

    return user;
  }

  protected generateUniqueUsername(): string {
    // the username
    let username: string;

    // keep trying to get a unique username
    do {
      username = Faker.internet.userName().toLowerCase();
    } while (this.usedUsernames[username]);

    // add to used usernames
    this.usedUsernames[username] = true;

    // return it
    return username;
  }
}
