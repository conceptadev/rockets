import Faker from '@faker-js/faker';
import { Type } from '@nestjs/common';
import { Factory } from '@concepta/typeorm-seeding';
import { UserEntityInterface } from './interfaces/user-entity.interface';

/**
 * User factory
 *
 * ```ts
 * // new factory instance
 * const userFactory = new UserFactory();
 * ```
 */
export class UserFactory extends Factory<UserEntityInterface> {
  /**
   * Options
   */
  options: { entity?: Type<UserEntityInterface> } = {};

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
    user.email = Faker.internet.email();

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
      username = Faker.internet.userName().toLowerCase();
    } while (this.usedUsernames[username]);

    // add to used usernames
    this.usedUsernames[username] = true;

    // return it
    return username;
  }
}
