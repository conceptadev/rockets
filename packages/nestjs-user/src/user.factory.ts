import { faker } from '@faker-js/faker';
import { Factory } from '@concepta/typeorm-seeding';
import { UserEntityInterface } from '@concepta/nestjs-common';

/**
 * User factory
 */
export class UserFactory extends Factory<UserEntityInterface> {
  /**
   * List of used usernames.
   */
  usedUsernames: Record<string, boolean> = {};

  /**
   * Factory callback function.
   */
  protected async entity(
    user: UserEntityInterface,
  ): Promise<UserEntityInterface> {
    // set the username
    user.username = this.generateUniqueUsername();

    // fake email address
    user.email = faker.internet.email();

    // return the new user
    return user;
  }

  /**
   * Generate a unique username.
   */
  protected generateUniqueUsername(): string {
    // the username
    let username: string;

    // keep trying to get a unique username
    do {
      username = faker.internet.userName().toLowerCase();
    } while (this.usedUsernames[username]);

    // add to used usernames
    this.usedUsernames[username] = true;

    // return it
    return username;
  }
}
