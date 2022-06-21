import Faker from '@faker-js/faker';
import { Type } from '@nestjs/common';
import { Factory } from '@jorgebodega/typeorm-seeding';
import { UserEntityInterface } from './interfaces/user-entity.interface';

/**
 * User factory
 *
 * ```ts
 * // new factory instance
 * UserFactory.entity = UserEntity;
 * const userFactory = new UserFactory();
 * ```
 */
export class UserFactory extends Factory<UserEntityInterface> {
  /**
   * entity The entity class.
   */
  public static entity: Type<UserEntityInterface>;

  /**
   * List of used usernames.
   */
  usedUsernames: Record<string, boolean> = {};

  /**
   * Factory callback function.
   */
  protected async definition(): Promise<UserEntityInterface> {
    // the user we will return
    const user = new UserFactory.entity();

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
