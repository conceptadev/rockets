import Faker from '@faker-js/faker';
import { Type } from '@nestjs/common';
import { Factory } from '@jorgebodega/typeorm-seeding';
import { UserEntityInterface } from './interfaces/user-entity.interface';

/**
 * User factory
 *
 * ```ts
 * // new factory instance
 * const userFactory = new UserFactory(User);
 * ```
 */
export class UserFactory<
  T extends UserEntityInterface = UserEntityInterface,
> extends Factory<T> {
  /**
   * Constructor.
   *
   * @param entity The entity class.
   */
  constructor(private entity: Type<T>) {
    super();
  }

  /**
   * List of used usernames.
   */
  usedUsernames: Record<string, boolean> = {};

  /**
   * Factory callback function.
   */
  protected async definition(): Promise<T> {
    // the user we will return
    const user = new this.entity();

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
