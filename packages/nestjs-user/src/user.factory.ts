import Faker from '@faker-js/faker';
import { Type } from '@nestjs/common';
import { define } from 'typeorm-seeding';
import { UserInterface } from './interfaces/user.interface';

/**
 * User factory.
 *
 * @template T
 */
export class UserFactory<T extends UserInterface = UserInterface> {
  /**
   * Constructor.
   *
   * @param {Type<T>} entityType
   */
  constructor(private entityType: Type<T>) {}

  /**
   * Define the user factory.
   */
  public define() {
    define(this.entityType, this.factoryFn(this.entityType));
  }

  /**
   * Factory callback function.
   */
  protected factoryFn(entityType: Type<T>) {
    // unique usernames that have already been used.
    const uniqueUsernames: Record<string, boolean> = {};

    return (faker: typeof Faker): T => {
      // the user we will return
      const user = new entityType();

      // keep trying to get a unique username
      do {
        user.username = faker.internet.userName().toLowerCase();
      } while (uniqueUsernames[user.username]);

      // add to used usernames
      uniqueUsernames[user.username] = true;

      // return the new user
      return user;
    };
  }
}
