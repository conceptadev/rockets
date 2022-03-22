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
   * Factory callback function.
   *
   * @param entity The entity class.
   */
  protected async definition(): Promise<T> {
    // unique usernames that have already been used.
    const uniqueUsernames: Record<string, boolean> = {};

    // the user we will return
    const user = new this.entity();

    // keep trying to get a unique username
    do {
      user.username = Faker.internet.userName().toLowerCase();
    } while (uniqueUsernames[user.username]);

    // add to used usernames
    uniqueUsernames[user.username] = true;

    // return the new user
    return user;
  }
}
